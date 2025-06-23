import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Itinerary = () => {
    const [prompt, setPrompt] = useState('');
    const [conversation, setConversation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!prompt.trim() || isLoading) return;
        setError(null);

        // Add user message with pending state
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: prompt,
            timestamp: new Date().toISOString(),
            status: 'sending'
        };

        setConversation(prev => [...prev, userMessage]);
        setPrompt('');
        setIsLoading(true);

        try {
            // Format messages for OpenRouter API
            const messages = [
                ...conversation
                    .filter(msg => msg.status !== 'error')
                    .map(({ role, content }) => ({ role, content })),
                { role: 'user', content: prompt }
            ];

            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: "deepseek/deepseek-chat", // or "deepseek/deepseek-r1:free"
                    messages,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                        'HTTP-Referer': window.location.href,
                        'X-Title': 'My AI App',
                        'Content-Type': 'application/json'
                    },
                    timeout: 60000 // 60 second timeout
                }
            );

            const aiMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: response.data.choices[0]?.message?.content || 'No response content',
                timestamp: new Date().toISOString(),
                status: 'received'
            };

            // Update conversation with successful response
            setConversation(prev =>
                prev.map(msg =>
                    msg.id === userMessage.id
                        ? { ...msg, status: 'sent' }
                        : msg
                ).concat(aiMessage)
            );
        } catch (error) {
            console.error('API Error:', error);

            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: getErrorMessage(error),
                timestamp: new Date().toISOString(),
                status: 'error'
            };

            setConversation(prev =>
                prev.map(msg =>
                    msg.id === userMessage.id
                        ? { ...msg, status: 'error' }
                        : msg
                ).concat(errorMessage)
            );
            setError(error.response?.data?.error?.message || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getErrorMessage = (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 400: return 'Invalid request. Please rephrase your message.';
                case 401: return 'API key issue. Please contact support.';
                case 402: return 'Payment required. This model requires credits.';
                case 429: return 'Rate limit exceeded. Please wait before trying again.';
                case 502: return 'Bad gateway. The AI service may be down.';
                default: return `Error: ${error.response.data?.error?.message || 'Unknown API error'}`;
            }
        }
        return error.message || 'Network error. Please check your connection.';
    };

    const retryMessage = async (messageId) => {
        const messageToRetry = conversation.find(msg => msg.id === messageId);
        if (!messageToRetry || messageToRetry.role !== 'assistant' || messageToRetry.status !== 'error') return;

        setIsLoading(true);
        try {
            // Get all messages up to the error
            const contextMessages = conversation
                .slice(0, conversation.findIndex(msg => msg.id === messageId))
                .filter(msg => msg.status !== 'error')
                .map(({ role, content }) => ({ role, content }));

            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: "deepseek/deepseek-chat",
                    messages: contextMessages,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setConversation(prev =>
                prev.map(msg =>
                    msg.id === messageId
                        ? {
                            ...msg,
                            content: response.data.choices[0]?.message?.content,
                            status: 'received',
                            timestamp: new Date().toISOString()
                        }
                        : msg
                )
            );
        } catch (error) {
            console.error('Retry failed:', error);
            setError('Retry failed: ' + getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <h2 className="text-xl font-bold mb-4">Itinerary Creation</h2>
            <p className="text-gray-600">Your Itinerary settings will be displayed here.</p>
            <div className="messages">
                {conversation.map((message) => (
                    <div key={message.id} className={`message ${message.role}`}>
                        <div className={`content ${message.status}`}>
                            {message.content}
                            {message.status === 'error' && (
                                <button
                                    onClick={() => retryMessage(message.id)}
                                    className="retry-button"
                                >
                                    Retry
                                </button>
                            )}
                        </div>
                        <div className="timestamp">
                            {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="input-area">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                />
                <button type="submit" disabled={!prompt.trim() || isLoading}>
                    {isLoading ? 'Sending...' : 'Send'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default Itinerary;

//     return (
//         <div className="flex flex-col h-screen max-w-3xl mx-auto p-4 bg-gray-50">
//             <header className="py-4 border-b border-gray-200">
//                 <h1 className="text-2xl font-bold text-center text-blue-600">DeepSeek Chat</h1>
//             </header>

//             <div className="flex-1 overflow-y-auto py-4 space-y-4">
//                 {conversation.map((msg, index) => (
//                     <div
//                         key={index}
//                         className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//                     >
//                         <div
//                             className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${msg.sender === 'user'
//                                 ? 'bg-blue-500 text-white'
//                                 : 'bg-gray-200 text-gray-800'
//                                 }`}
//                         >
//                             <p className="whitespace-pre-wrap">{msg.text}</p>
//                         </div>
//                     </div>
//                 ))}

//                 {isLoading && (
//                     <div className="flex justify-start">
//                         <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 max-w-xs">
//                             <div className="flex space-x-2">
//                                 <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
//                                 <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-100"></div>
//                                 <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-200"></div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 <div ref={messagesEndRef} />
//             </div>

//             <form onSubmit={handleSubmit} className="mt-4">
//                 <div className="flex space-x-2">
//                     <textarea
//                         value={prompt}
//                         onChange={(e) => setPrompt(e.target.value)}
//                         placeholder="Type your message here..."
//                         className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                         rows={3}
//                         disabled={isLoading}
//                     />
//                     <button
//                         type="submit"
//                         disabled={!prompt.trim() || isLoading}
//                         className={`px-4 py-2 rounded-lg text-white font-medium ${(!prompt.trim() || isLoading)
//                             ? 'bg-gray-400 cursor-not-allowed'
//                             : 'bg-blue-600 hover:bg-blue-700'
//                             }`}
//                     >
//                         {isLoading ? (
//                             <span className="flex items-center">
//                                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                 </svg>
//                                 Sending
//                             </span>
//                         ) : 'Send'}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default DeepSeekChat;