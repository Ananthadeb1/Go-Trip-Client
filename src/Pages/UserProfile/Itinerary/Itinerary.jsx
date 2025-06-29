import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaSave, FaStop, FaUndo } from 'react-icons/fa';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import useAuth from '../../../hooks/useAuth';
import Swal from 'sweetalert2';

const ItineraryGenerator = () => {
    // State for form inputs
    const [location, setLocation] = useState('');
    const [days, setDays] = useState(2);
    const axiosPublic = useAxiosPublic();
    const { loggedUser } = useAuth();

    // State for API interaction
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [abortController, setAbortController] = useState(null);

    // State for itinerary data
    const [itineraryData, setItineraryData] = useState(null);
    const [existingItinerary, setExistingItinerary] = useState(null);
    const [previousItinerary, setPreviousItinerary] = useState(null);

    // Color theme
    const colors = {
        primary: '#EC003F',
        secondary: '#FF6B8B',
        accent: '#FFA500',
        background: '#FFF5F7',
        text: '#333333'
    };

    // Ref for top of results section
    const resultsRef = useRef(null);

    // Load existing itinerary on component mount
    useEffect(() => {
        const fetchExistingItinerary = async () => {
            try {
                const response = await axiosPublic.get(`/itineraries/${loggedUser._id}`);
                if (response.data) {
                    setExistingItinerary(response.data);
                    setLocation(response.data.location);
                    setDays(response.data.days);
                    setItineraryData(response.data.itinerary);
                }
            } catch (error) {
                console.log('No existing itinerary found,', error);
            }
        };

        if (loggedUser?.uid) {
            fetchExistingItinerary();
        }
    }, [loggedUser?.uid, axiosPublic]);

    // Stop generation function
    const stopGeneration = () => {
        if (abortController) {
            abortController.abort();
            setIsLoading(false);
            setError('Generation stopped by user');
        }
    };

    // Restore previous itinerary
    const restorePreviousItinerary = () => {
        if (previousItinerary) {
            setItineraryData(previousItinerary.itinerary);
            setLocation(previousItinerary.location);
            setDays(previousItinerary.days);
            setExistingItinerary(previousItinerary);
            setPreviousItinerary(null);
        }
    };

    // Extract JSON from API response
    const extractJsonFromResponse = (response) => {
        try {
            const codeBlockRegex = /```json\n([\s\S]*?)\n```/;
            const match = response.match(codeBlockRegex);
            if (match && match[1]) {
                return JSON.parse(match[1]);
            }
            return JSON.parse(response);
        } catch (e) {
            console.error("Failed to parse JSON:", e);
            return null;
        }
    };

    // Save itinerary to database
    const saveItinerary = async () => {
        try {
            await axiosPublic.patch(`/itineraries/${loggedUser._id}`, {
                userId: loggedUser._id,
                location,
                days,
                itinerary: itineraryData,
                updatedAt: new Date().toISOString()
            });
            setExistingItinerary({
                location,
                days,
                itinerary: itineraryData
            });
            setPreviousItinerary(null);
            // Show success SweetAlert2
            Swal.fire({
                icon: 'success',
                title: 'Saved!',
                text: 'Itinerary saved successfully!',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Save failed:', error);
            setError('Failed to save itinerary');
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to save itinerary'
            });
        }
    };

    // Generate new itinerary
    const generateItinerary = async (e) => {
        e.preventDefault();
        if (!location.trim() || isLoading) return;

        const controller = new AbortController();
        setAbortController(controller);
        setPreviousItinerary(existingItinerary);
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: "deepseek/deepseek-chat",
                    messages: [{
                        role: "user",
                        content: `Create a ${days}-day itinerary for ${location}, Bangladesh in JSON format. Structure: { itinerary: { day1: { morning: { activity, description, duration, location }, ... } }`
                    }],
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                }
            );

            const content = response.data.choices[0]?.message?.content || '';
            const parsedData = extractJsonFromResponse(content);

            if (parsedData) {
                setItineraryData(parsedData);
                if (resultsRef.current) {
                    resultsRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                throw new Error('Invalid itinerary format received');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Generation failed:', error);
                setError(getErrorMessage(error));
            }
        } finally {
            setIsLoading(false);
            setAbortController(null);
        }
    };

    // Error message handler
    const getErrorMessage = (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 400: return 'Invalid request';
                case 402: return 'API service requires payment';
                case 429: return 'Too many requests';
                default: return error.response.data?.error?.message || 'API error';
            }
        }
        return error.message || 'Network error';
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
                        Travel Itinerary Generator
                    </h1>
                    <p className="text-lg" style={{ color: colors.primary }}>
                        Plan your perfect trip across Bangladesh
                    </p>
                </div>

                {/* Input Form */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <form onSubmit={generateItinerary} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                                    Destination
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaMapMarkerAlt className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. Cox's Bazar"
                                        className="pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        style={{ borderColor: colors.primary }}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                                    Days
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaCalendarAlt className="text-gray-400" />
                                    </div>
                                    <select
                                        value={days}
                                        onChange={(e) => setDays(parseInt(e.target.value))}
                                        className="pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        style={{ borderColor: colors.primary }}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                            <option key={num} value={num}>{num} day{num !== 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: colors.primary }}
                                >
                                    {isLoading ? 'Generating...' : 'Generate Itinerary'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Results Section */}
                <div ref={resultsRef}>
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                            <p>{error}</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex justify-center items-center p-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: colors.primary }}></div>
                            <button
                                onClick={stopGeneration}
                                className="ml-4 flex items-center space-x-2 px-4 py-2 rounded-lg text-white"
                                style={{ backgroundColor: colors.accent }}
                            >
                                <FaStop />
                                <span>Stop Generation</span>
                            </button>
                        </div>
                    )}

                    {(itineraryData || existingItinerary) && (
                        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
                                        {location} Itinerary ({days} day{days !== 1 ? 's' : ''})
                                    </h2>
                                    <div className="flex space-x-2">
                                        {previousItinerary && (
                                            <button
                                                onClick={restorePreviousItinerary}
                                                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white"
                                                style={{ backgroundColor: colors.secondary }}
                                            >
                                                <FaUndo />
                                                <span>Restore Previous</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={saveItinerary}
                                            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white"
                                            style={{ backgroundColor: colors.accent }}
                                        >
                                            <FaSave />
                                            <span>Save Itinerary</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {Object.entries((itineraryData || existingItinerary.itinerary).itinerary).map(([dayKey, dayData]) => (
                                        <div key={dayKey} className="border rounded-lg overflow-hidden">
                                            <div className="bg-gray-50 px-4 py-3 border-b">
                                                <h3 className="font-semibold" style={{ color: colors.primary }}>
                                                    {dayKey.replace('day', 'Day ')}
                                                </h3>
                                            </div>
                                            <div className="divide-y">
                                                {Object.entries(dayData).map(([timeKey, timeData]) => (
                                                    <div key={timeKey} className="p-4">
                                                        <div className="flex items-center mb-2">
                                                            <span className="capitalize font-medium mr-2" style={{ color: colors.secondary }}>
                                                                {timeKey}:
                                                            </span>
                                                            <h4 className="font-medium" style={{ color: colors.text }}>
                                                                {timeData.activity}
                                                            </h4>
                                                        </div>
                                                        <p className="text-gray-600 mb-2">{timeData.description}</p>
                                                        <div className="flex flex-wrap gap-4 text-sm">
                                                            <div className="flex items-center text-gray-500">
                                                                <FaClock className="mr-1" />
                                                                {timeData.duration}
                                                            </div>
                                                            <div className="flex items-center text-gray-500">
                                                                <FaMapMarkerAlt className="mr-1" />
                                                                {timeData.location}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItineraryGenerator;