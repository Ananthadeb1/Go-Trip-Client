import { useState, useEffect, useRef } from "react";
import PaymentModal from "../HotelDetails/Components/BookingCard/PaymentModal/PaymentModal";
import {
    faBus,
    faPlane,
    faMapMarkerAlt,
    faCalendarDay,
    faUser,
    faArrowRight,
    faCheckCircle,
    faHeart,
    faStar
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DatePicker from "react-datepicker";
import ReviewModal from "../HotelDetails/Components/BookingCard/ReviewModal/ReviewModal";

// Sample data with more locations
const locationSuggestions = [
    "Dhaka", "Chittagong", "Cox's Bazar", "Sylhet", "Khulna",
    "Rajshahi", "Barisal", "Rangpur", "Mymensingh", "Comilla",
    "Narayanganj", "Gazipur", "Narsingdi", "Tangail", "Bogra",
    "Pabna", "Jessore", "Dinajpur", "Faridpur", "Kushtia",
    "Jamalpur", "Patuakhali", "Satkhira", "Bagerhat", "Chuadanga",
    "Meherpur", "Magura", "Jhenaidah", "Narail", "Shariatpur",
    "Madaripur", "Gopalganj", "Munshiganj", "Manikganj", "Sherpur",
    "Netrokona", "Sunamganj", "Habiganj", "Moulvibazar", "Brahmanbaria",
    "Chandpur", "Lakshmipur", "Noakhali", "Feni", "Bandarban",
    "Khagrachari", "Rangamati", "Pirojpur", "Jhalokathi", "Barguna",
    "Bhola", "Panchagarh", "Thakurgaon", "Nilphamari", "Lalmonirhat",
    "Kurigram", "Gaibandha", "Joypurhat", "Naogaon", "Natore",
    "Chapainawabganj", "Sirajganj", "Kishoreganj", "Rajbari",
    "DAC (Hazrat Shahjalal Intl)", "CGP (Shah Amanat Intl)",
    "ZYL (Osmany Intl)", "JSR (Jessore)", "RJH (Rajshahi)"
];

const vehicleData = {
    buses: [
        {
            id: "bus1",
            operator: "Green Line",
            type: "AC Business Class",
            departure: { time: "08:00 AM", location: "Dhaka" },
            arrival: { time: "11:30 AM", location: "Kishoreganj" },
            duration: "3h 30m",
            price: 800,
            seats: [
                { id: "A1", status: "available" },
                { id: "A2", status: "available" },
                { id: "A3", status: "available" },
                { id: "B1", status: "available" },
                { id: "B2", status: "booked" },
                { id: "B3", status: "available" },
            ],
            amenities: ["AC", "Reclining Seats", "TV", "Water"],
            image: "https://example.com/bus1.jpg"
        },
        {
            id: "bus2",
            operator: "Shohagh Paribahan",
            type: "Non-AC",
            departure: { time: "10:00 AM", location: "Dhaka" },
            arrival: { time: "01:30 PM", location: "Kishoreganj" },
            duration: "3h 30m",
            price: 500,
            seats: [
                { id: "S1", status: "available" },
                { id: "S2", status: "available" },
                { id: "S3", status: "available" },
                { id: "S4", status: "booked" },
            ],
            amenities: ["Reclining Seats", "Water"],
            image: "https://example.com/bus2.jpg"
        },
        // {
        //     id: "bus3",
        //     operator: "Hanif Enterprise",
        //     type: "AC Business Class",
        //     departure: { time: "02:00 PM", location: "Dhaka" },
        //     arrival: { time: "05:30 PM", location: "Kishoreganj" },
        //     duration: "3h 30m",
        //     price: 900,
        //     seats: [
        //         { id: "C1", status: "available" },
        //         { id: "C2", status: "available" },
        //         { id: "C3", status: "booked" },
        //         { id: "D1", status: "available" },
        //         { id: "D2", status: "available" },
        //     ],
        //     amenities: ["AC", "Reclining Seats", "TV", "Water", "Snacks"],
        //     image: "https://example.com/bus3.jpg"
        // },
        // {
        //     id: "bus4",
        //     operator: "Ena Transport",
        //     type: "Non-AC",
        //     departure: { time: "06:00 PM", location: "Dhaka" },
        //     arrival: { time: "09:30 PM", location: "Kishoreganj" },
        //     duration: "3h 30m",
        //     price: 550,
        //     seats: [
        //         { id: "E1", status: "available" },
        //         { id: "E2", status: "available" },
        //         { id: "E3", status: "available" },
        //         { id: "F1", status: "available" },
        //         { id: "F2", status: "booked" },
        //     ],
        //     amenities: ["Reclining Seats", "Water"],
        //     image: "https://example.com/bus4.jpg"
        // }
    ],
    flights: [
        // ... (keep the existing flight data)
    ]
};

const VehicleBooking = () => {
    const [step, setStep] = useState(1);
    const [searchParams, setSearchParams] = useState({
        from: "",
        to: "",
        date: null,
        passengers: 1,
        vehicleType: "bus"
    });
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [fromSuggestions, setFromSuggestions] = useState([]);
    const [toSuggestions, setToSuggestions] = useState([]);
    const [showFromSuggestions, setShowFromSuggestions] = useState(false);
    const [showToSuggestions, setShowToSuggestions] = useState(false);
    const [favoriteSearches, setFavoriteSearches] = useState([]);
    const [noResults, setNoResults] = useState(false);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [searchTriggered, setSearchTriggered] = useState(false);

    //payment modal
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activePaymentMethod, setActivePaymentMethod] = useState(null)

    // Refs for suggestion dropdowns
    const fromInputRef = useRef(null);
    const toInputRef = useRef(null);
    const fromSuggestionsRef = useRef(null);
    const toSuggestionsRef = useRef(null);

    // Load favorite searches from localStorage on component mount
    useEffect(() => {
        const savedFavorites = localStorage.getItem('favoriteSearches');
        if (savedFavorites) {
            setFavoriteSearches(JSON.parse(savedFavorites));
        }

        // Add click outside listeners
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Save favorite searches to localStorage when they change
    useEffect(() => {
        localStorage.setItem('favoriteSearches', JSON.stringify(favoriteSearches));
    }, [favoriteSearches]);

    // Filter vehicles when search is triggered
    useEffect(() => {
        if (searchTriggered) {
            const filtered = searchParams.vehicleType === "bus"
                ? vehicleData.buses.filter(v =>
                    v.departure.location.toLowerCase().includes(searchParams.from.toLowerCase()) &&
                    v.arrival.location.toLowerCase().includes(searchParams.to.toLowerCase()))
                : vehicleData.flights.filter(v =>
                    v.departure.location.toLowerCase().includes(searchParams.from.toLowerCase()) &&
                    v.arrival.location.toLowerCase().includes(searchParams.to.toLowerCase()));

            setFilteredVehicles(filtered);
            setSearchTriggered(false);
        }
    }, [searchTriggered, searchParams]);

    // Handle clicks outside suggestion boxes
    const handleClickOutside = (event) => {
        if (fromSuggestionsRef.current && !fromSuggestionsRef.current.contains(event.target) &&
            fromInputRef.current && !fromInputRef.current.contains(event.target)) {
            setShowFromSuggestions(false);
        }
        if (toSuggestionsRef.current && !toSuggestionsRef.current.contains(event.target) &&
            toInputRef.current && !toInputRef.current.contains(event.target)) {
            setShowToSuggestions(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        console.log("Search Params:", searchParams);
        if (
            searchParams.from &&
            searchParams.to &&
            searchParams.date &&
            new Date(searchParams.date) >= new Date() &&
            searchParams.passengers > 0
        ) {
            setStep(2);
        }

        // Validate date
        if (!searchParams.date || new Date(searchParams.date) < new Date()) {
            alert('Please select a valid future date');
            return;
        }

        // Validate required fields
        if (!searchParams.from || !searchParams.to) {
            alert('Please fill in all required fields');
            return;
        }

        setSearchTriggered(true);
    };

    useEffect(() => {
        if (filteredVehicles.length === 0 && searchTriggered === false && searchParams.from && searchParams.to) {
            setNoResults(true);
        } else if (filteredVehicles.length > 0) {
            setNoResults(false);
            setStep(2);
            setSelectedVehicle(null);
            setSelectedSeats([]);
        }
    }, [filteredVehicles, searchTriggered]);

    const handleSeatSelection = (seatId) => {
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seatId));
        } else {
            if (selectedSeats.length < searchParams.passengers) {
                setSelectedSeats([...selectedSeats, seatId]);
            }
        }
    };

    const calculateTotal = () => {
        if (!selectedVehicle) return 0;
        return selectedVehicle.price * selectedSeats.length;
    };

    const handleFromInputChange = (value) => {
        setSearchParams({ ...searchParams, from: value });
        if (value.length > 0) {
            const filtered = locationSuggestions.filter(loc =>
                loc.toLowerCase().includes(value.toLowerCase())
            );
            setFromSuggestions(filtered);
            setShowFromSuggestions(true);
        } else {
            setFromSuggestions([]);
            setShowFromSuggestions(false);
        }
    };

    const handleToInputChange = (value) => {
        setSearchParams({ ...searchParams, to: value });
        if (value.length > 0) {
            const filtered = locationSuggestions.filter(loc =>
                loc.toLowerCase().includes(value.toLowerCase())
            );
            setToSuggestions(filtered);
            setShowToSuggestions(true);
        } else {
            setToSuggestions([]);
            setShowToSuggestions(false);
        }
    };

    const selectSuggestion = (field, value) => {
        setSearchParams(prev => ({ ...prev, [field]: value }));
        if (field === 'from') {
            setShowFromSuggestions(false);
            if (toInputRef.current) {
                toInputRef.current.focus();
            }
        } else {
            setShowToSuggestions(false);
        }
    };

    const addToFavorites = () => {
        const newFavorite = {
            from: searchParams.from,
            to: searchParams.to,
            vehicleType: searchParams.vehicleType,
            date: new Date().toLocaleDateString()
        };

        if (!favoriteSearches.some(fav =>
            fav.from === newFavorite.from &&
            fav.to === newFavorite.to &&
            fav.vehicleType === newFavorite.vehicleType
        )) {
            setFavoriteSearches([...favoriteSearches, newFavorite]);
            // Show a small toast alert at the top instead of alert()
            const toast = document.createElement('div');
            toast.textContent = 'Search saved to favorites!';
            toast.style.position = 'fixed';
            toast.style.top = '32px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.background = '#FF2056';
            toast.style.color = '#fff';
            toast.style.padding = '12px 24px';
            toast.style.borderRadius = '8px';
            toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            toast.style.zIndex = 9999;
            toast.style.fontWeight = 'bold';
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.transition = 'opacity 0.5s';
                toast.style.opacity = '0';
                setTimeout(() => document.body.removeChild(toast), 500);
            }, 1500);
        }
    };

    const handleFavoriteSearch = (favorite) => {
        setSearchParams({
            ...searchParams,
            from: favorite.from,
            to: favorite.to,
            vehicleType: favorite.vehicleType
        });
    };

    const removeFavorite = (index) => {
        const newFavorites = [...favoriteSearches];
        newFavorites.splice(index, 1);
        setFavoriteSearches(newFavorites);
    };

    const handlePayment = () => {
        const total = calculateTotal();
        if (total > 0) {
            // Show PaymentModal
            setPaymentModalOpen(true);
            addToFavorites();
        } else {
            alert('Please select a vehicle and seats to proceed.');
        }
    };

    return (
        <div className="sticky top-4">
            {paymentModalOpen && (
                <PaymentModal
                    bookingSuccess={bookingSuccess}
                    setBookingSuccess={setBookingSuccess}
                    setPaymentModalOpen={setPaymentModalOpen}
                    setReviewModalOpen={setReviewModalOpen}
                    paymentError={paymentError}
                    setPaymentError={setPaymentError}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    activePaymentMethod={activePaymentMethod}
                    setActivePaymentMethod={setActivePaymentMethod}
                    totalPrice={calculateTotal() + Math.round(selectedVehicle.price * 0.1)}
                    type={searchParams.vehicleType}
                    vehicleId={selectedVehicle ? selectedVehicle.id : null}
                    from={searchParams.from}
                    dest={searchParams.to}
                    journeyDate={searchParams.date ? searchParams.date.toLocaleDateString() : ""}
                    passengers={searchParams.passengers}
                    selectedSeats={searchParams.selectedSeats}
                    vehicleName={selectedVehicle ? selectedVehicle.operator : ""}
                    vehicleType={selectedVehicle ? selectedVehicle.type : ""}
                    favoriteSearches={favoriteSearches}

                />
            )}
            {reviewModalOpen && (
                <ReviewModal
                    setReviewModalOpen={setReviewModalOpen}
                />
            )}

            <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
                {/* Progress Steps */}
                <div className="flex justify-between items-center mb-8 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
                    {[1, 2, 3].map((stepNumber) => (
                        <div key={stepNumber} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                            ${step >= stepNumber ? 'bg-[#FF2056] text-white' : 'bg-gray-200 text-gray-600'}`}>
                                {stepNumber}
                            </div>
                            <span className="mt-2 text-sm font-medium">
                                {stepNumber === 1 ? 'Search' : stepNumber === 2 ? 'Select' : 'Confirm'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Step 1: Search Form */}
                {step === 1 && (
                    <div className="bg-[#FFEAEE] p-6 rounded-xl">
                        <h2 className="text-2xl font-bold text-[#FF2056] mb-6">Book Your Journey</h2>
                        <form onSubmit={handleSearch}>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            ref={fromInputRef}
                                            type="text"
                                            placeholder="City or Station"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF2056] focus:border-[#FF2056]"
                                            value={searchParams.from}
                                            onChange={(e) => handleFromInputChange(e.target.value)}
                                            onFocus={() => {
                                                if (searchParams.from.length > 0) {
                                                    setShowFromSuggestions(true);
                                                }
                                            }}
                                            required
                                        />
                                        {showFromSuggestions && fromSuggestions.length > 0 && (
                                            <ul
                                                ref={fromSuggestionsRef}
                                                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                                            >
                                                {fromSuggestions.map((suggestion, index) => (
                                                    <li
                                                        key={index}
                                                        className="px-4 py-2 hover:bg-[#FFEAEE] cursor-pointer"
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => selectSuggestion('from', suggestion)}
                                                    >
                                                        {suggestion}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            ref={toInputRef}
                                            type="text"
                                            placeholder="City or Station"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF2056] focus:border-[#FF2056]"
                                            value={searchParams.to}
                                            onChange={(e) => handleToInputChange(e.target.value)}
                                            onFocus={() => {
                                                if (searchParams.to.length > 0) {
                                                    setShowToSuggestions(true);
                                                }
                                            }}
                                            required
                                        />
                                        {showToSuggestions && toSuggestions.length > 0 && (
                                            <ul
                                                ref={toSuggestionsRef}
                                                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                                            >
                                                {toSuggestions.map((suggestion, index) => (
                                                    <li
                                                        key={index}
                                                        className="px-4 py-2 hover:bg-[#FFEAEE] cursor-pointer"
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => selectSuggestion('to', suggestion)}
                                                    >
                                                        {suggestion}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faCalendarDay} className="absolute left-3 top-3 text-gray-400" />
                                        <DatePicker
                                            selected={searchParams.date}
                                            onChange={(date) => setSearchParams({ ...searchParams, date })}
                                            minDate={new Date()}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF2056] focus:border-[#FF2056]"
                                            placeholderText="Select date"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faUser} className="absolute left-3 top-3 text-gray-400" />
                                        <select
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF2056] focus:border-[#FF2056]"
                                            value={searchParams.passengers}
                                            onChange={(e) => setSearchParams({ ...searchParams, passengers: parseInt(e.target.value) })}
                                        >
                                            {[1, 2, 3, 4, 5, 6].map(num => (
                                                <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4 mb-6">
                                <button
                                    type="button"
                                    className={`px-6 py-3 rounded-lg font-medium flex items-center ${searchParams.vehicleType === 'bus' ? 'bg-[#FF2056] text-white' : 'bg-gray-200 text-gray-700'}`}
                                    onClick={() => {
                                        setSearchParams({ ...searchParams, vehicleType: 'bus' });
                                        setFilteredVehicles([]);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faBus} className="mr-2" />
                                    Bus Tickets
                                </button>
                                <button
                                    type="button"
                                    className={`px-6 py-3 rounded-lg font-medium flex items-center ${searchParams.vehicleType === 'flight' ? 'bg-[#4285F4] text-white' : 'bg-gray-200 text-gray-700'}`}
                                    onClick={() => {
                                        setSearchParams({ ...searchParams, vehicleType: 'flight' });
                                        setFilteredVehicles([]);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faPlane} className="mr-2" />
                                    Flight Tickets
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#FF2056] to-[#FF6B8B] text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
                            >
                                Search {searchParams.vehicleType === 'bus' ? 'Buses' : 'Flights'}
                            </button>
                        </form>

                        {/* Favorite Searches Section */}
                        {favoriteSearches.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-3 text-[#4285F4] flex items-center">
                                    <FontAwesomeIcon icon={faStar} className="mr-2 text-yellow-400" />
                                    Your Favorite Searches
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {favoriteSearches.map((fav, index) => (
                                        <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{fav.from} → {fav.to}</p>
                                                <p className="text-sm text-gray-500 capitalize">{fav.vehicleType} • {fav.date}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleFavoriteSearch(fav)}
                                                    className="text-[#4285F4] hover:text-[#3367D6]"
                                                >
                                                    Use
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFavorite(index)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Vehicle Selection */}
                {step === 2 && (
                    <div>
                        <h2 className="text-2xl font-bold text-[#FF2056] mb-6">Available {searchParams.vehicleType === 'bus' ? 'Buses' : 'Flights'}</h2>

                        {noResults ? (
                            <div className="bg-[#E8F0FE] p-6 rounded-xl text-center">
                                <div className="max-w-md mx-auto">
                                    <FontAwesomeIcon icon={faHeart} className="text-[#4285F4] text-4xl mb-4" />
                                    <h3 className="text-xl font-bold text-[#4285F4] mb-2">No {searchParams.vehicleType === 'bus' ? 'buses' : 'flights'} found</h3>
                                    <p className="text-gray-600 mb-4">
                                        We couldn't find any {searchParams.vehicleType === 'bus' ? 'buses' : 'flights'} matching your search criteria.
                                    </p>
                                    <div className="flex justify-center space-x-4">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="px-6 py-2 border border-[#FF2056] text-[#FF2056] rounded-lg hover:bg-[#FFEAEE]"
                                        >
                                            Modify Search
                                        </button>
                                        <button
                                            type="button"
                                            onClick={addToFavorites}
                                            className="px-6 py-2 bg-[#4285F4] text-white rounded-lg hover:bg-[#3367D6] flex items-center"
                                        >
                                            <FontAwesomeIcon icon={faHeart} className="mr-2" />
                                            Save Search
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-6 mb-8">
                                    {filteredVehicles.map(vehicle => (
                                        <div
                                            key={vehicle.id}
                                            className={`border rounded-xl p-6 cursor-pointer transition-all ${selectedVehicle?.id === vehicle.id ? 'border-[#FF2056] bg-[#FFEAEE]' : 'border-gray-200 hover:border-[#FF2056]/50'}`}
                                            onClick={() => {
                                                setSelectedVehicle(vehicle);
                                                setSelectedSeats([]);
                                            }}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                                <div className="flex items-center mb-4 md:mb-0">
                                                    <div className={`p-3 rounded-full mr-4 ${searchParams.vehicleType === 'bus' ? 'bg-[#FFEAEE] text-[#FF2056]' : 'bg-blue-100 text-[#4285F4]'}`}>
                                                        <FontAwesomeIcon icon={searchParams.vehicleType === 'bus' ? faBus : faPlane} size="lg" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">
                                                            {searchParams.vehicleType === 'bus' ? vehicle.operator : vehicle.airline}
                                                        </h3>
                                                        <p className="text-gray-500">
                                                            {searchParams.vehicleType === 'bus' ? vehicle.type : `Flight ${vehicle.flightNo}`}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
                                                    <div className="text-center">
                                                        <p className="font-bold text-lg">{vehicle.departure.time}</p>
                                                        <p className="text-gray-600">{vehicle.departure.location}</p>
                                                        {searchParams.vehicleType === 'flight' && (
                                                            <p className="text-xs text-gray-500">{vehicle.departure.terminal}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-center px-4">
                                                        <p className="text-gray-500 text-sm">{vehicle.duration}</p>
                                                        <div className="w-16 h-px bg-gray-300 my-2"></div>
                                                        <p className="text-xs text-gray-500">Direct</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-lg">{vehicle.arrival.time}</p>
                                                        <p className="text-gray-600">{vehicle.arrival.location}</p>
                                                        {searchParams.vehicleType === 'flight' && (
                                                            <p className="text-xs text-gray-500">{vehicle.arrival.terminal}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-[#FF2056]">
                                                            BDT {vehicle.price}
                                                        </p>
                                                        <p className="text-sm text-gray-500">per seat</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedVehicle && (
                                    <div className="mt-8">
                                        <h3 className="text-xl font-semibold mb-4">Select Seats ({selectedSeats.length}/{searchParams.passengers} selected)</h3>
                                        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
                                            {selectedVehicle.seats.map(seat => (
                                                <button
                                                    key={seat.id}
                                                    type="button"
                                                    className={`p-3 rounded-lg text-center font-medium ${seat.status === 'booked'
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : selectedSeats.includes(seat.id)
                                                            ? 'bg-[#FF2056] text-white'
                                                            : 'bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                    onClick={() => seat.status !== 'booked' && handleSeatSelection(seat.id)}
                                                    disabled={seat.status === 'booked'}
                                                >
                                                    {seat.id}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between mt-8">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep(1);
                                            setNoResults(false);
                                        }}
                                        className="px-6 py-2 border border-[#FF2056] text-[#FF2056] rounded-lg hover:bg-[#FFEAEE]"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        disabled={!selectedVehicle || selectedSeats.length !== searchParams.passengers}
                                        className={`px-6 py-2 rounded-lg flex items-center ${!selectedVehicle || selectedSeats.length !== searchParams.passengers
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-[#FF2056] text-white hover:bg-[#E61C4D]'
                                            }`}
                                    >
                                        Continue <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                    <div>
                        <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6">
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2" />
                                <p className="text-green-700 font-medium">Almost done! Review your booking details</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl">
                                <h3 className="text-xl font-semibold mb-4">Journey Details</h3>

                                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                                    <div className="flex items-center mb-3">
                                        <div className={`p-2 rounded-full mr-3 ${searchParams.vehicleType === 'bus' ? 'bg-[#FFEAEE] text-[#FF2056]' : 'bg-blue-100 text-[#4285F4]'}`}>
                                            <FontAwesomeIcon icon={searchParams.vehicleType === 'bus' ? faBus : faPlane} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold">
                                                {searchParams.vehicleType === 'bus' ? selectedVehicle.operator : selectedVehicle.airline}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {searchParams.vehicleType === 'bus' ? selectedVehicle.type : `Flight ${selectedVehicle.flightNo}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold">{selectedVehicle.departure.time}</p>
                                            <p className="text-gray-600">{selectedVehicle.departure.location}</p>
                                            {searchParams.vehicleType === 'flight' && (
                                                <p className="text-xs text-gray-500">{selectedVehicle.departure.terminal}</p>
                                            )}
                                        </div>
                                        <div className="text-center px-4">
                                            <p className="text-gray-500 text-sm">{selectedVehicle.duration}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{selectedVehicle.arrival.time}</p>
                                            <p className="text-gray-600">{selectedVehicle.arrival.location}</p>
                                            {searchParams.vehicleType === 'flight' && (
                                                <p className="text-xs text-gray-500">{selectedVehicle.arrival.terminal}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="font-semibold mb-3">Passenger Details</h4>
                                    <div className="space-y-3">
                                        {Array.from({ length: searchParams.passengers }).map((_, i) => (
                                            <div key={i} className="border-b pb-3">
                                                <p className="font-medium">Passenger {i + 1}</p>
                                                <p className="text-sm text-gray-500">Seat: {selectedSeats[i]}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl">
                                <h3 className="text-xl font-semibold mb-4">Payment Summary</h3>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Base Fare</span>
                                        <span>BDT {selectedVehicle.price} x {selectedSeats.length}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Taxes & Fees</span>
                                        <span>BDT {Math.round(selectedVehicle.price * 0.1)}</span>
                                    </div>
                                    <div className="border-t my-3"></div>
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>BDT {calculateTotal() + Math.round(selectedVehicle.price * 0.1)}</span>
                                    </div>

                                    <button onClick={handlePayment} type="button"
                                        className="w-full mt-6 bg-[#FF2056] text-white py-3 rounded-lg hover:bg-[#E61C4D] font-medium"
                                    >
                                        Confirm & Pay
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="px-6 py-2 border border-[#FF2056] text-[#FF2056] rounded-lg hover:bg-[#FFEAEE]"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleBooking;