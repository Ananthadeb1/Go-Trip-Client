import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaSave, FaStop, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import useAuth from '../../../hooks/useAuth';
import Swal from 'sweetalert2';

const ItineraryGenerator = () => {
    // State for form inputs (Separated from display list)
    const [location, setLocation] = useState('');
    const [days, setDays] = useState(2);
    const axiosPublic = useAxiosPublic();
    const { loggedUser } = useAuth();

    // State for API interaction
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [abortController, setAbortController] = useState(null);

    // Main itinerary state array (Max 2 saved) and transient storage (1 unsaved)
    const [savedItineraries, setSavedItineraries] = useState([]);
    const [newlyGenerated, setNewlyGenerated] = useState(null);
    const [expandedKey, setExpandedKey] = useState(null);

    const colors = {
        primary: '#EC003F',
        secondary: '#FF6B8B',
        accent: '#FFA500',
        background: '#FFF5F7',
        text: '#333333'
    };

    const resultsRef = useRef(null);

    // Optimized Performance: Check Local Storage first, fetch from API ONLY if cache is empty
    useEffect(() => {
        let isMounted = true;
        
        const fetchSavedItineraries = async () => {
            if (!loggedUser?._id) return;

            // Step 1: Check performance cache first
            const cachedData = localStorage.getItem(`itineraries_${loggedUser._id}`);
            if (cachedData) {
                const parsedCache = JSON.parse(cachedData);
                if (isMounted) {
                    setSavedItineraries(parsedCache);
                    if (parsedCache.length > 0) setExpandedKey(0);
                    return; // Prevent making database call completely if cached!
                }
            }

            // Step 2: Fallback to database only if no local cache exists
            try {
                const response = await axiosPublic.get(`/itineraries/${loggedUser._id}`);
                if (response.data && isMounted) {
                    // Normalize the database format into a clean array structure
                    let data = [];
                    if (Array.isArray(response.data)) {
                        data = response.data;
                    } else if (response.data.itineraries) {
                        data = response.data.itineraries;
                    } else if (response.data.location) {
                        data = [response.data];
                    }
                    
                    const cleanSaved = data.slice(0, 2);
                    setSavedItineraries(cleanSaved);
                    localStorage.setItem(`itineraries_${loggedUser._id}`, JSON.stringify(cleanSaved));
                    
                    if (cleanSaved.length > 0) {
                        setExpandedKey(0);
                    }
                }
            } catch (error) {
                console.log('No existing itineraries found in cloud.', error);
            }
        };

        fetchSavedItineraries();

        // Prevents browser background port detachment loops
        return () => {
            isMounted = false;
        };
    }, [loggedUser?._id, axiosPublic]);

    // Clean up active requests when unmounting to stop "disconnected port" errors
    useEffect(() => {
        return () => {
            if (abortController) {
                abortController.abort();
            }
        };
    }, [abortController]);

    const stopGeneration = () => {
        if (abortController) {
            abortController.abort();
            setIsLoading(false);
            setError('Generation stopped by user');
        }
    };

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

    const generateItinerary = async (e) => {
        e.preventDefault();
        if (!location.trim() || isLoading) return;

        const controller = new AbortController();
        setAbortController(controller);
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: "deepseek/deepseek-chat",
                    messages: [
                        {
                            role: "system",
                            content: "You are a professional local travel guide for Bangladesh. Generate compact, highly specific, and accurate travel itineraries in JSON format. Do not include markdown code fences, headers, or any explanatory text."
                        },
                        {
                            role: "user",
                            content: `Generate a logical ${days}-day itinerary for ${location}, Bangladesh. Ensure a sequential geographic route to minimize travel time. Include real landmark names, local food experiences, and realistic durations. Keep descriptions to 1 practical sentence.
Return ONLY valid JSON matching this exact structure containing day1 to day${days}:
{
  "itinerary": {
    "day1": {
      "morning": { "activity": "Real Landmark", "description": "Short tip.", "duration": "2h", "location": "Area name" },
      "afternoon": { "activity": "Real Landmark/Food", "description": "Short tip.", "duration": "1.5h", "location": "Area name" },
      "evening": { "activity": "Real Landmark", "description": "Short tip.", "duration": "2h", "location": "Area name" }
    }
  }
}`
                        }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.5
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
                const newItin = {
                    location: location,
                    days: days,
                    itinerary: parsedData.itinerary || parsedData
                };
                setNewlyGenerated(newItin);
                setExpandedKey('generated');
                setLocation(''); 

                setTimeout(() => {
                    if (resultsRef.current) {
                        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            } else {
                throw new Error('Invalid itinerary format received');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                setError(error.response?.data?.error?.message || error.message || 'Network error');
            }
        } finally {
            setIsLoading(false);
            setAbortController(null);
        }
    };

    // Fixes the overwrite bug: Now correctly appends, keeps 2, and saves to local storage + DB
    const saveCurrentItinerary = async () => {
        if (!newlyGenerated || !loggedUser?._id) return;

        let updatedList = [...savedItineraries];

        // Ejection strategy rule (Max 2 capacity management)
        if (updatedList.length >= 2) {
            updatedList.shift(); // Remove oldest record
        }

        const newItem = {
            location: newlyGenerated.location,
            days: newlyGenerated.days,
            itinerary: newlyGenerated.itinerary,
            updatedAt: new Date().toISOString()
        };

        updatedList.push(newItem);

        try {
            // Send entire array containing both saved profiles down to backend endpoint securely
            await axiosPublic.patch(`/itineraries/${loggedUser._id}`, {
                userId: loggedUser._id,
                itineraries: updatedList 
            });
            
            // Sync states locally for immediate seamless interface response
            setSavedItineraries(updatedList);
            localStorage.setItem(`itineraries_${loggedUser._id}`, JSON.stringify(updatedList));
            
            setNewlyGenerated(null);
            setExpandedKey(updatedList.length - 1); // Expand the newly added one

            Swal.fire({
                icon: 'success',
                title: 'Saved Successfully!',
                text: 'Both itineraries are locked and will persist through refreshes.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Save failed:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update database records' });
        }
    };

    const deleteSavedItinerary = async (indexToDelete) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will remove this saved travel plan.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Yes, remove it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const filteredList = savedItineraries.filter((_, idx) => idx !== indexToDelete);
                    
                    await axiosPublic.patch(`/itineraries/${loggedUser._id}`, {
                        userId: loggedUser._id,
                        itineraries: filteredList
                    });

                    setSavedItineraries(filteredList);
                    localStorage.setItem(`itineraries_${loggedUser._id}`, JSON.stringify(filteredList));
                    
                    if (filteredList.length > 0) {
                        setExpandedKey(0);
                    } else {
                        setExpandedKey(null);
                    }

                    Swal.fire('Removed!', 'Itinerary removed.', 'success');
                } catch (error) {
                    console.error('Delete action failure:', error);
                    Swal.fire('Error', 'Failed to update database records.', 'error');
                }
            }
        });
    };

    const renderDayTimeline = (targetItinerary) => {
        const targetObj = targetItinerary.itinerary?.itinerary || targetItinerary.itinerary;
        if (!targetObj || typeof targetObj !== 'object') return null;

        return (
            <div className="space-y-6 mt-4 pt-4 border-t border-gray-100">
                {Object.entries(targetObj).map(([dayKey, dayData]) => (
                    <div key={dayKey} className="border rounded-lg overflow-hidden bg-white">
                        <div className="bg-gray-50 px-4 py-2 border-b">
                            <h3 className="font-semibold text-sm capitalize" style={{ color: colors.primary }}>
                                {dayKey.replace('day', 'Day ')}
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {dayData && typeof dayData === 'object' && Object.entries(dayData).map(([timeKey, timeData]) => (
                                <div key={timeKey} className="p-4 text-sm">
                                    <div className="flex items-center mb-1">
                                        <span className="capitalize font-medium mr-2 text-xs px-2 py-0.5 rounded bg-pink-50" style={{ color: colors.secondary }}>
                                            {timeKey}
                                        </span>
                                        <h4 className="font-semibold text-gray-800">
                                            {timeData?.activity || 'Explore Spot'}
                                        </h4>
                                    </div>
                                    <p className="text-gray-600 my-1">{timeData?.description}</p>
                                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-2">
                                        <div className="flex items-center"><FaClock className="mr-1" />{timeData?.duration || 'Flexible'}</div>
                                        <div className="flex items-center"><FaMapMarkerAlt className="mr-1" />{timeData?.location || 'Local Destination'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
                        Travel Itinerary Planner
                    </h1>
                    <p className="text-sm font-medium" style={{ color: colors.primary }}>
                        Saves 2 configurations securely • Instant performance cached loads
                    </p>
                </div>

                {/* Form Input Container */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-pink-100">
                    <form onSubmit={generateItinerary} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-gray-500">Destination</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaMapMarkerAlt className="text-gray-400 text-sm" />
                                    </div>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. Cox's Bazar, Sreemangal"
                                        className="pl-9 w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                                        style={{ borderColor: '#E5E7EB' }}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-gray-500">Duration</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaCalendarAlt className="text-gray-400 text-sm" />
                                    </div>
                                    <select
                                        value={days}
                                        onChange={(e) => setDays(parseInt(e.target.value))}
                                        className="pl-9 w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                                        style={{ borderColor: '#E5E7EB' }}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                            <option key={num} value={num}>{num} Day{num !== 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
                                    style={{ backgroundColor: colors.primary }}
                                >
                                    {isLoading ? 'Generating Plan...' : 'Generate Itinerary'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div ref={resultsRef}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg text-sm">
                            <p>{error}</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex justify-center items-center p-8 bg-white rounded-xl shadow-sm mb-6 border border-gray-100">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: colors.primary }}></div>
                            <button
                                onClick={stopGeneration}
                                className="ml-4 flex items-center space-x-2 px-3 py-1.5 rounded-lg text-white text-xs font-medium"
                                style={{ backgroundColor: colors.accent }}
                            >
                                <FaStop className="text-xs" />
                                <span>Cancel</span>
                            </button>
                        </div>
                    )}

                    <div className="space-y-3">
                        {/* 1. UNSAVED TRANSIENT SEARCH CARD */}
                        {newlyGenerated && (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-dashed transition-all animate-fade-in" style={{ borderColor: colors.primary }}>
                                <div 
                                    className="p-4 flex justify-between items-center cursor-pointer select-none bg-red-50/40"
                                    onClick={() => setExpandedKey(expandedKey === 'generated' ? null : 'generated')}
                                >
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">Unsaved Result</span>
                                            <h2 className="text-lg font-bold text-gray-800">
                                                {newlyGenerated.location} ({newlyGenerated.days} Days)
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); saveCurrentItinerary(); }}
                                            className="flex items-center space-x-1.5 px-3 py-1 rounded-md text-white text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity"
                                            style={{ backgroundColor: colors.accent }}
                                        >
                                            <FaSave className="text-xs" />
                                            <span>Save Plan</span>
                                        </button>
                                        {expandedKey === 'generated' ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                                    </div>
                                </div>
                                {expandedKey === 'generated' && (
                                    <div className="p-4 bg-white">
                                        {renderDayTimeline(newlyGenerated)}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 2. DYNAMIC SAVED PROFILE ACCORDION CARDS */}
                        {savedItineraries.map((savedItem, idx) => {
                            const isExpanded = expandedKey === idx;
                            return (
                                <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all">
                                    <div 
                                        className="p-4 flex justify-between items-center cursor-pointer select-none hover:bg-gray-50/50"
                                        onClick={() => setExpandedKey(isExpanded ? null : idx)}
                                    >
                                        <div>
                                            <h2 className={`font-bold transition-all ${isExpanded ? 'text-lg text-gray-800' : 'text-sm text-gray-500'}`}>
                                                {savedItem.location} <span className="font-normal text-xs text-gray-400">({savedItem.days} Days Plan)</span>
                                            </h2>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteSavedItinerary(idx); }}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                            {isExpanded ? <FaChevronUp className="text-gray-400 text-xs" /> : <FaChevronDown className="text-gray-400 text-xs" />}
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div className="p-4 bg-white">
                                            {renderDayTimeline(savedItem)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {!newlyGenerated && savedItineraries.length === 0 && !isLoading && (
                            <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-dashed border-gray-200">
                                Enter your next setup configuration above to run custom generation itineraries.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItineraryGenerator;