import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import PaymentModal from "../HotelDetails/Components/BookingCard/PaymentModal/PaymentModal";
import {
    faBus,
    faTrain,
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

const locationSuggestions = [
    "Dhaka", "Chattogram", "Cox's Bazar", "Sylhet", "Khulna",
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
    "Chapainawabganj", "Sirajganj", "Kishoreganj", "Rajbari"
];

// ---------------------------------------------------------------------------
// Helpers: deterministic route + seat generation so that every one of the
// 64 districts has a connection to every other district, even if no static
// vehicle entry exists for that exact pair in vehicleData.
// ---------------------------------------------------------------------------

const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

const busOperatorNames = [
    "Green Line Paribahan", "Hanif Enterprise", "Shyamoli NR Travels",
    "Ena Transport", "Soudia Coach Service", "Desh Travels",
    "SR Travels", "Nabil Paribahan"
];

const trainNames = [
    "Subarna Express", "Sonar Bangla Express", "Egarosindur Express",
    "Mohanagar Provati", "Turna Nishitha", "Parabat Express",
    "Ekota Express", "Chitra Express"
];

// Generates a seat map. Bus = 2+2 layout (A,B | aisle | C,D).
// Train = 3+2 layout (A,B,C | aisle | D,E), matching common BD railway coaches.
const generateSeatLayout = (type, bookedRatio = 0.35) => {
    const seats = [];
    const rows = 10;
    const cols = type === "bus" ? ["A", "B", "C", "D"] : ["A", "B", "C", "D", "E"];

    for (let r = 1; r <= rows; r++) {
        cols.forEach((col, idx) => {
            seats.push({
                id: `${r}${col}`,
                row: r,
                col: idx,
                status: Math.random() < bookedRatio ? "booked" : "available"
            });
        });
    }
    return seats;
};

// Static vehicleData entries may store seats in an old flat format
// ({id, status} with no row/col), which the row-based seat map below can't
// render. This guarantees every vehicle — static or generated — has a
// proper 2D layout, while preserving any pre-existing booked seats by id.
const normalizeVehicleSeats = (vehicle, vehicleType) => {
    const hasProperLayout = Array.isArray(vehicle.seats) &&
        vehicle.seats.length > 0 &&
        typeof vehicle.seats[0].row === 'number';

    if (hasProperLayout) return vehicle;

    const layout = generateSeatLayout(vehicleType);

    if (Array.isArray(vehicle.seats)) {
        const bookedIds = new Set(
            vehicle.seats.filter(s => s.status === 'booked').map(s => s.id)
        );
        layout.forEach(seat => {
            if (bookedIds.has(seat.id)) seat.status = 'booked';
        });
    }

    return { ...vehicle, seats: layout };
};

const formatTime = (h) => {
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:00 ${period}`;
};

// Auto-generates plausible vehicles for a from/to pair that isn't in the
// static dataset, guaranteeing every district-to-district search returns
// real, bookable options instead of "no vehicles found".
const generateVehicles = (from, to, vehicleType) => {
    if (!from || !to || from.trim().toLowerCase() === to.trim().toLowerCase()) {
        return [];
    }

    const seed = hashCode(`${from.toLowerCase()}-${to.toLowerCase()}-${vehicleType}`);
    const names = vehicleType === "bus" ? busOperatorNames : trainNames;
    const count = 3 + (seed % 3); // 3 to 5 options per route

    const vehicles = [];
    for (let i = 0; i < count; i++) {
        const opSeed = seed + i * 97;
        const operator = names[opSeed % names.length];
        const startHour = (opSeed % 16) + 5; // departs 5 AM - 8 PM
        const durationHours = 3 + (opSeed % 8); // 3-10 hour journey
        const arrivalHour = (startHour + durationHours) % 24;
        const price = vehicleType === "bus"
            ? 300 + (opSeed % 900)
            : 250 + (opSeed % 700);

        vehicles.push({
            id: `gen-${vehicleType}-${from}-${to}-${i}`,
            operator,
            type: vehicleType === "bus"
                ? (opSeed % 2 === 0 ? "AC Business Class" : "Non-AC Chair Coach")
                : (opSeed % 2 === 0 ? "Shovon Chair" : "AC Chair"),
            departure: {
                time: formatTime(startHour),
                location: from,
                station: `${from} ${vehicleType === "bus" ? "Bus Terminal" : "Railway Station"}`
            },
            arrival: {
                time: formatTime(arrivalHour),
                location: to,
                station: `${to} ${vehicleType === "bus" ? "Bus Terminal" : "Railway Station"}`
            },
            duration: `${durationHours}h`,
            price,
            seats: generateSeatLayout(vehicleType, 0.3 + (opSeed % 20) / 100)
        });
    }
    return vehicles;
};

const VehicleBooking = ({ vehicleData }) => {
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
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activePaymentMethod, setActivePaymentMethod] = useState(null);

    const fromInputRef = useRef(null);
    const toInputRef = useRef(null);
    const fromSuggestionsRef = useRef(null);
    const toSuggestionsRef = useRef(null);

    useEffect(() => {
        // VULNERABILITY FIX: JSON.parse on raw localStorage content can throw
        // if the value is malformed or has been tampered with (e.g. via
        // devtools or a third-party extension), which would crash the whole
        // component on mount. Wrap it and fall back to a safe default, and
        // validate the shape before trusting it.
        try {
            const savedFavorites = localStorage.getItem('favoriteSearches');
            if (savedFavorites) {
                const parsed = JSON.parse(savedFavorites);
                if (Array.isArray(parsed)) {
                    setFavoriteSearches(parsed);
                }
            }
        } catch (err) {
            console.error('Could not read saved favorite searches:', err);
            localStorage.removeItem('favoriteSearches');
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('favoriteSearches', JSON.stringify(favoriteSearches));
        } catch (err) {
            console.error('Could not save favorite searches:', err);
        }
    }, [favoriteSearches]);

    // Runs the search against static data, and falls back to a generated
    // route (see generateVehicles) whenever the static dataset has no
    // matching entry, so every district pair is always connected.
    useEffect(() => {
        if (searchTriggered) {
            const seenVehicles = new Set();
            const sourceData = searchParams.vehicleType === "bus"
                ? vehicleData.buses
                : vehicleData.trains;

            let filtered = sourceData.filter(v => {
                const isMatch = v.departure.location.toLowerCase().includes(searchParams.from.toLowerCase()) &&
                    v.arrival.location.toLowerCase().includes(searchParams.to.toLowerCase());

                const vehicleKey = `${v.operator}-${v.departure.time}-${v.arrival.time}`;

                if (isMatch && !seenVehicles.has(vehicleKey)) {
                    seenVehicles.add(vehicleKey);
                    return true;
                }
                return false;
            }).map(v => normalizeVehicleSeats(v, searchParams.vehicleType));

            // No static route for this pair? Auto-generate one so the
            // search never comes back empty for a valid district pair.
            if (filtered.length === 0) {
                filtered = generateVehicles(searchParams.from, searchParams.to, searchParams.vehicleType);
            }

            setFilteredVehicles(filtered);
            setSearchTriggered(false);
        }
    }, [searchTriggered, searchParams, vehicleData]);

    // Always advances to the results step once a search completes, whether
    // or not any vehicles were found, so the "no vehicles found" message
    // actually renders instead of getting stuck on step 1.
    useEffect(() => {
        if (searchTriggered === false && searchParams.from && searchParams.to) {
            setStep(2);
            if (filteredVehicles.length === 0) {
                setNoResults(true);
                // Pop up an explicit alert in addition to the inline message,
                // so the "no vehicle available" state is impossible to miss.
                Swal.fire({
                    icon: 'info',
                    title: 'No vehicle available',
                    text: `We couldn't find any ${searchParams.vehicleType === 'bus' ? 'buses' : 'trains'} from ${searchParams.from} to ${searchParams.to} on the selected date.`,
                    confirmButtonColor: '#FF2056'
                });
            } else {
                setNoResults(false);
                setSelectedVehicle(null);
                setSelectedSeats([]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredVehicles, searchTriggered]);

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
        if (!searchParams.date || new Date(searchParams.date) < new Date()) {
            Swal.fire({
                icon: 'warning',
                title: 'No option available for today',
                text: 'Please select a valid future date.',
                confirmButtonColor: '#FF2056'
            });
            return;
        }
        if (!searchParams.from || !searchParams.to) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing information',
                text: 'Please fill in all required fields.',
                confirmButtonColor: '#FF2056'
            });
            return;
        }
        if (searchParams.from.trim().toLowerCase() === searchParams.to.trim().toLowerCase()) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid route',
                text: 'Origin and destination cannot be the same. Please choose different districts.',
                confirmButtonColor: '#FF2056'
            });
            return;
        }
        setSearchTriggered(true);
    };

    const handleSeatSelection = (seatId) => {
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seatId));
        } else if (selectedSeats.length < searchParams.passengers) {
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    const calculateTotal = () => {
        return selectedVehicle ? selectedVehicle.price * selectedSeats.length : 0;
    };

    const handleFromInputChange = (value) => {
        setSearchParams({ ...searchParams, from: value });
        if (value.length > 0) {
            setFromSuggestions(locationSuggestions.filter(loc =>
                loc.toLowerCase().includes(value.toLowerCase())
            ));
            setShowFromSuggestions(true);
        } else {
            setFromSuggestions([]);
            setShowFromSuggestions(false);
        }
    };

    const handleToInputChange = (value) => {
        setSearchParams({ ...searchParams, to: value });
        if (value.length > 0) {
            setToSuggestions(locationSuggestions.filter(loc =>
                loc.toLowerCase().includes(value.toLowerCase())
            ));
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
            toInputRef.current?.focus();
        } else {
            setShowToSuggestions(false);
        }
    };

    const addToFavorites = () => {
        const newFavorite = {
            // VULNERABILITY FIX: trim free-text input before persisting it,
            // so stray whitespace can't create duplicate-looking favorites
            // or slip untrimmed values into localStorage/UI.
            from: searchParams.from.trim(),
            to: searchParams.to.trim(),
            vehicleType: searchParams.vehicleType,
            date: new Date().toLocaleDateString()
        };

        if (!favoriteSearches.some(fav =>
            fav.from === newFavorite.from &&
            fav.to === newFavorite.to &&
            fav.vehicleType === newFavorite.vehicleType
        )) {
            setFavoriteSearches([...favoriteSearches, newFavorite]);
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
        setFavoriteSearches(favoriteSearches.filter((_, i) => i !== index));
    };

    const handlePayment = () => {
        if (calculateTotal() > 0) {
            setPaymentModalOpen(true);
            addToFavorites();
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Selection required',
                text: 'Please select a vehicle and seats to proceed.',
                confirmButtonColor: '#FF2056'
            });
        }
    };

    // Renders a seat as a button, color-coded by availability/selection.
    const renderSeatButton = (seat) => {
        const isSelected = selectedSeats.includes(seat.id);
        const isBooked = seat.status === 'booked';
        return (
            <button
                key={seat.id}
                type="button"
                disabled={isBooked}
                onClick={() => handleSeatSelection(seat.id)}
                title={isBooked ? 'Already booked' : seat.id}
                className={`w-9 h-9 rounded-md text-[11px] font-semibold flex items-center justify-center transition-colors
                    ${isBooked
                        ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                        : isSelected
                            ? 'bg-[#FF2056] text-white'
                            : 'bg-white border border-gray-300 hover:border-[#FF2056] text-gray-700'
                    }`}
            >
                {seat.id}
            </button>
        );
    };

    // Full seat map: groups seats by row and splits them into a left block
    // and right block with an aisle gap, mimicking real bus/train seating.
    const renderSeatMap = () => {
        if (!selectedVehicle) return null;
        const leftCount = searchParams.vehicleType === 'bus' ? 2 : 3;
        const rowNumbers = [...new Set(selectedVehicle.seats.map(s => s.row))];

        return (
            <div className="max-w-md mx-auto bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex justify-end mb-4 pr-1">
                    <div className="flex items-center text-xs text-gray-500 border border-gray-300 rounded-full px-3 py-1">
                        <FontAwesomeIcon
                            icon={searchParams.vehicleType === 'bus' ? faBus : faTrain}
                            className="mr-2"
                        />
                        {searchParams.vehicleType === 'bus' ? 'Driver / Front' : 'Engine / Front'}
                    </div>
                </div>

                <div className="space-y-2">
                    {rowNumbers.map(row => {
                        const rowSeats = selectedVehicle.seats.filter(s => s.row === row);
                        const leftSeats = rowSeats.filter(s => s.col < leftCount);
                        const rightSeats = rowSeats.filter(s => s.col >= leftCount);

                        return (
                            <div key={row} className="flex items-center justify-center space-x-3">
                                <span className="w-4 text-xs text-gray-400">{row}</span>
                                <div className="flex space-x-2">
                                    {leftSeats.map(renderSeatButton)}
                                </div>
                                <div className="w-6"></div>
                                <div className="flex space-x-2">
                                    {rightSeats.map(renderSeatButton)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
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
                    vehicleId={selectedVehicle?.id}
                    from={searchParams.from}
                    dest={searchParams.to}
                    journeyDate={searchParams.date?.toLocaleDateString() || ""}
                    passengers={searchParams.passengers}
                    selectedSeats={selectedSeats}
                    vehicleName={selectedVehicle?.operator || ""}
                    vehicleType={selectedVehicle?.type || ""}
                    favoriteSearches={favoriteSearches}
                />
            )}
            {reviewModalOpen && <ReviewModal setReviewModalOpen={setReviewModalOpen} />}

            <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
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
                                            onFocus={() => setShowFromSuggestions(searchParams.from.length > 0)}
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
                                            onFocus={() => setShowToSuggestions(searchParams.to.length > 0)}
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
                                    onClick={() => setSearchParams({ ...searchParams, vehicleType: 'bus' })}
                                >
                                    <FontAwesomeIcon icon={faBus} className="mr-2" />
                                    Bus Tickets
                                </button>
                                <button
                                    type="button"
                                    className={`px-6 py-3 rounded-lg font-medium flex items-center ${searchParams.vehicleType === 'train' ? 'bg-[#4285F4] text-white' : 'bg-gray-200 text-gray-700'}`}
                                    onClick={() => setSearchParams({ ...searchParams, vehicleType: 'train' })}
                                >
                                    <FontAwesomeIcon icon={faTrain} className="mr-2" />
                                    Train Tickets
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#FF2056] to-[#FF6B8B] text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
                            >
                                Search {searchParams.vehicleType === 'bus' ? 'Buses' : 'Trains'}
                            </button>
                        </form>

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

                {step === 2 && (
                    <div>
                        <h2 className="text-2xl font-bold text-[#FF2056] mb-6">Available {searchParams.vehicleType === 'bus' ? 'Buses' : 'Trains'}</h2>

                        {noResults ? (
                            <div className="bg-[#E8F0FE] p-6 rounded-xl text-center">
                                <div className="max-w-md mx-auto">
                                    <FontAwesomeIcon icon={faHeart} className="text-[#4285F4] text-4xl mb-4" />
                                    <h3 className="text-xl font-bold text-[#4285F4] mb-2">No {searchParams.vehicleType === 'bus' ? 'buses' : 'trains'} found</h3>
                                    <p className="text-gray-600 mb-4">
                                        We couldn't find any {searchParams.vehicleType === 'bus' ? 'buses' : 'trains'} from{' '}
                                        <span className="font-medium">{searchParams.from}</span> to{' '}
                                        <span className="font-medium">{searchParams.to}</span>. Double-check the district
                                        spelling, or try the other vehicle type.
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
                                                        <FontAwesomeIcon icon={searchParams.vehicleType === 'bus' ? faBus : faTrain} size="lg" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">{vehicle.operator}</h3>
                                                        <p className="text-gray-500">{vehicle.type}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
                                                    <div className="text-center">
                                                        <p className="font-bold text-lg">{vehicle.departure.time}</p>
                                                        <p className="text-gray-600">{vehicle.departure.location}</p>
                                                        {searchParams.vehicleType === 'train' && (
                                                            <p className="text-xs text-gray-500">{vehicle.departure.station}</p>
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
                                                        {searchParams.vehicleType === 'train' && (
                                                            <p className="text-xs text-gray-500">{vehicle.arrival.station}</p>
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
                                        <h3 className="text-xl font-semibold mb-4">
                                            Select Seats ({selectedSeats.length}/{searchParams.passengers} selected)
                                        </h3>

                                        <div className="flex items-center justify-center space-x-6 mb-4 text-sm text-gray-600">
                                            <div className="flex items-center space-x-2">
                                                <span className="w-5 h-5 rounded bg-white border border-gray-300 inline-block"></span>
                                                <span>Available</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="w-5 h-5 rounded bg-[#FF2056] inline-block"></span>
                                                <span>Selected</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="w-5 h-5 rounded bg-gray-300 inline-block"></span>
                                                <span>Booked</span>
                                            </div>
                                        </div>

                                        {renderSeatMap()}
                                    </div>
                                )}

                                <div className="flex justify-between mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
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
                                            <FontAwesomeIcon icon={searchParams.vehicleType === 'bus' ? faBus : faTrain} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold">{selectedVehicle.operator}</h4>
                                            <p className="text-sm text-gray-500">{selectedVehicle.type}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold">{selectedVehicle.departure.time}</p>
                                            <p className="text-gray-600">{selectedVehicle.departure.location}</p>
                                            {searchParams.vehicleType === 'train' && (
                                                <p className="text-xs text-gray-500">{selectedVehicle.departure.station}</p>
                                            )}
                                        </div>
                                        <div className="text-center px-4">
                                            <p className="text-gray-500 text-sm">{selectedVehicle.duration}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{selectedVehicle.arrival.time}</p>
                                            <p className="text-gray-600">{selectedVehicle.arrival.location}</p>
                                            {searchParams.vehicleType === 'train' && (
                                                <p className="text-xs text-gray-500">{selectedVehicle.arrival.station}</p>
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