/* eslint-disable no-unused-vars */
import { useState, } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { faFilter, faMagnifyingGlass, faSort, faStar, faMapMarkerAlt, faUserFriends, faBed, faWifi, faSwimmingPool, faUtensils } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DatePicker from "react-datepicker";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "../../Utils/Motion/Motion";
import VehicleBooking from "./VehicleBooking/VehicleBooking";

const Booking = () => {
    const axioxPublic = useAxiosPublic();
    const { data: hotels, isLoading, isError } = useQuery({
        queryKey: ["hotels"],
        queryFn: async () => {
            const response = await axioxPublic.get("/hotels");
            console.log("Fetched hotels:", response.data);
            return response.data;
        },
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOption, setSelectedOption] = useState("Hotel");
    const [searchErrors, setSearchErrors] = useState({});

    // Search states
    const [searchParams, setSearchParams] = useState({
        destination: "",
        checkInDate: "",
        checkOutDate: "",
        totalPersons: "",
        sortOption: "",
        roomTypeFilter: ""
    });
    const [appliedFilters, setAppliedFilters] = useState({
        destination: "",
        checkInDate: "",
        checkOutDate: "",
        totalPersons: ""
    });

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen ">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-16 w-16 bg-[#FF2056] rounded-full mb-4"></div>
                <p className="text-[#FF2056] font-medium">Loading amazing stays...</p>
            </div>
        </div>
    );

    if (isError) return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#FFF5F7] to-[#FFEAEE]">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <p className="text-red-500 text-lg font-medium">Error loading hotels. Please try again later.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-[#FF2056] text-white rounded-lg hover:bg-[#E61C4D] transition-colors"
                >
                    Retry
                </button>
            </div>
        </div>
    );

    const itemsPerPage = 9;

    // Get unique destinations and room types
    const destinations = [...new Set(hotels?.map((hotel) => hotel.location))];
    const roomTypes = [...new Set(hotels?.flatMap(hotel => hotel.rooms.map(room => room.type)))];

    // Animation variants
    const cardVariants = {
        offscreen: {
            y: 50,
            opacity: 0
        },
        onscreen: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                bounce: 0.4,
                duration: 0.8
            }
        }
    };

    // Validate search form
    const validateSearch = () => {
        const errors = {};
        if (!searchParams.destination) errors.destination = "Destination is required";
        if (!searchParams.checkInDate) errors.checkInDate = "Check-in date is required";
        if (!searchParams.checkOutDate) errors.checkOutDate = "Check-out date is required";
        if (!searchParams.totalPersons) errors.totalPersons = "Number of guests is required";

        setSearchErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Apply filters when search button is clicked
    const applyFilters = (e) => {
        e.preventDefault();
        if (!validateSearch()) return;

        setAppliedFilters({
            destination: searchParams.destination,
            checkInDate: searchParams.checkInDate,
            checkOutDate: searchParams.checkOutDate,
            totalPersons: searchParams.totalPersons
        });
        setCurrentPage(1);
    };

    // Filter hotels based on all criteria
    const filteredHotels = hotels?.filter(hotel => {
        // Destination filter
        const matchesDestination = !appliedFilters.destination ||
            hotel.location.toLowerCase().includes(appliedFilters.destination.toLowerCase());

        return matchesDestination;
    }).flatMap(hotel => {
        // Filter rooms based on room type and occupancy
        return hotel.rooms
            .filter(room => {
                const matchesRoomType = !searchParams.roomTypeFilter ||
                    room.type === searchParams.roomTypeFilter;
                const matchesOccupancy = !appliedFilters.totalPersons ||
                    room.maxOccupancy >= parseInt(appliedFilters.totalPersons);

                return matchesRoomType && matchesOccupancy;
            })
            .map((room, roomIndex) => ({
                ...hotel,
                roomDetails: room,
                roomIndex,
                // Calculate average rating
                averageRating: hotel.reviews?.length > 0
                    ? (hotel.reviews.reduce((sum, review) => sum + review.rating, 0) / hotel.reviews.length).toFixed(1)
                    : "No ratings"
            }));
    });

    // Sort the filtered results
    const sortedHotels = [...(filteredHotels || [])].sort((a, b) => {
        if (searchParams.sortOption === "price-high-low") {
            return b.roomDetails.pricePerNight - a.roomDetails.pricePerNight;
        } else if (searchParams.sortOption === "price-low-high") {
            return a.roomDetails.pricePerNight - b.roomDetails.pricePerNight;
        } else if (searchParams.sortOption === "rating-high-low") {
            return (b.averageRating === "No ratings" ? 0 : parseFloat(b.averageRating)) -
                (a.averageRating === "No ratings" ? 0 : parseFloat(a.averageRating));
        }
        return 0;
    });

    const totalPages = Math.ceil((sortedHotels?.length || 0) / itemsPerPage) || 1;
    const paginatedHotels = sortedHotels?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Fill empty slots if less than 9 cards
    const displayHotels = paginatedHotels ? [...paginatedHotels] : [];
    while (displayHotels.length < itemsPerPage && displayHotels.length > 0) {
        displayHotels.push({ empty: true });
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when field is filled
        if (value && searchErrors[name]) {
            setSearchErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }

        // Apply filters immediately for sort and room type
        if (name === "sortOption" || name === "roomTypeFilter") {
            setCurrentPage(1);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Amenity icons mapping
    const amenityIcons = {
        'wifi': faWifi,
        'pool': faSwimmingPool,
        'restaurant': faUtensils,
        'breakfast': faUtensils
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-rose-50 to-indigo-50 py-8">
            <motion.div
                initial="hidden"
                animate="show"
                variants={staggerContainer}
                className="container mx-auto px-4"
            >
                {/* Options Selector */}
                <motion.div
                    variants={fadeIn('down', 'spring', 0.2, 1)}
                    className="flex justify-center space-x-4 mb-8"
                >
                    {["Hotel", "Vehicle"].map((option) => (
                        <motion.button
                            key={option}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedOption(option)}
                            className={`px-6 py-3 rounded-full cursor-pointer text-lg font-medium transition-all
                                ${selectedOption === option
                                    ? "bg-[#FF2056] text-white shadow-lg"
                                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                                }`}
                        >
                            {option}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Content based on selected option */}
                {selectedOption === "Hotel" && (
                    <motion.div
                        variants={fadeIn('up', 'spring', 0.4, 1)}
                        className="rounded-2xl overflow-hidden"
                    >
                        {/* Search Bar */}
                        <motion.div
                            whileHover={{ scale: 1.005 }}
                            className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/90"
                        >
                            <form onSubmit={applyFilters}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                                {/* Destination Dropdown */}
                                <div className="relative">
                                    <select
                                        name="destination"
                                        className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#FF2056] focus:border-[#FF2056] bg-white/90 ${searchErrors.destination ? "ring-2 ring-red-500" : ""}`}
                                        value={searchParams.destination}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Destination</option>
                                        {destinations?.map((destination, index) => (
                                            <option key={index} value={destination}>
                                                {destination}
                                            </option>
                                        ))}
                                    </select>
                                    {searchErrors.destination && (
                                        <p className="absolute -bottom-5 text-xs text-red-500">{searchErrors.destination}</p>
                                    )}
                                </div>

                                {/* Check-in Date */}
                                <div className="relative z-50">
                                    <DatePicker
                                        selected={searchParams.checkInDate ? new Date(searchParams.checkInDate) : null}
                                        onChange={date => {
                                            const formattedDate = date ? date.toISOString().split('T')[0] : "";
                                            setSearchParams(prev => ({
                                                ...prev,
                                                checkInDate: formattedDate
                                            }));
                                            // Clear error when field is filled
                                            if (formattedDate && searchErrors.checkInDate) {
                                                setSearchErrors(prev => ({
                                                    ...prev,
                                                    checkInDate: undefined
                                                }));
                                            }
                                        }}
                                        minDate={new Date()}
                                        selectsStart
                                        startDate={searchParams.checkInDate ? new Date(searchParams.checkInDate) : null}
                                        endDate={searchParams.checkOutDate ? new Date(searchParams.checkOutDate) : null}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-[#FF2056] focus:border-[#FF2056] bg-white/90 text-center"
                                        placeholderText="Select check-in"
                                        dateFormat="dd-MM-yyyy"
                                        id="checkInDate"
                                        name="checkInDate"
                                        required
                                        popperPlacement="bottom-start"
                                        popperModifiers={[
                                            {
                                                name: "zIndex",
                                                enabled: true,
                                                phase: "write",
                                                fn: ({ state }) => {
                                                    state.styles.popper.zIndex = 9999;
                                                }
                                            }
                                        ]}
                                    />
                                    {searchErrors.checkInDate && (
                                        <p className="absolute -bottom-5 text-xs text-red-500">{searchErrors.checkInDate}</p>
                                    )}
                                </div>
                                {/* checkOutDate */}
                                <div className="relative z-10">
                                    <DatePicker
                                        selected={searchParams.checkOutDate ? new Date(searchParams.checkOutDate) : null}
                                        onChange={date => {
                                            const formattedDate = date ? date.toISOString().split('T')[0] : "";
                                            setSearchParams(prev => ({
                                                ...prev,
                                                checkOutDate: formattedDate
                                            }));
                                            // Clear error when field is filled
                                            if (formattedDate && searchErrors.checkOutDate) {
                                                setSearchErrors(prev => ({
                                                    ...prev,
                                                    checkOutDate: undefined
                                                }));
                                            }
                                        }}
                                        minDate={searchParams.checkInDate ? new Date(searchParams.checkInDate) : new Date()}
                                        selectsEnd
                                        startDate={searchParams.checkInDate ? new Date(searchParams.checkInDate) : null}
                                        endDate={searchParams.checkOutDate ? new Date(searchParams.checkOutDate) : null}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-[#FF2056] focus:border-[#FF2056] bg-white/90 text-center"
                                        placeholderText="Select check-out"
                                        dateFormat="dd-MM-yyyy"
                                        id="checkOutDate"
                                        name="checkOutDate"
                                        required
                                    />
                                    {searchErrors.checkOutDate && (
                                        <p className="absolute -bottom-5 text-xs text-red-500">{searchErrors.checkOutDate}</p>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="totalPersons"
                                        min="1"
                                        placeholder="Total Guests"
                                        className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#FF2056] focus:border-[#FF2056] bg-white/90 ${searchErrors.totalPersons ? "ring-2 ring-red-500" : ""}`}
                                        value={searchParams.totalPersons}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {searchErrors.totalPersons && (
                                        <p className="absolute -bottom-5 text-xs text-red-500">{searchErrors.totalPersons}</p>
                                    )}
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="bg-gradient-to-r from-[#FF2056] to-[#FF6B8B] text-white font-bold px-4 py-3 rounded-lg transition-all flex items-center justify-center shadow-lg hover:shadow-[#FF2056]/30"
                                >
                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" />
                                    Search Hotels
                                </motion.button>
                            </form>
                        </motion.div>

                        {/* Sort and Filter Options */}
                        <motion.div
                            variants={fadeIn('up', 'spring', 0.6, 1)}
                            className="p-6 flex flex-wrap justify-between items-center bg-white/80 backdrop-blur-sm rounded-lg mt-4 shadow-sm border border-white/90"
                        >
                            <div className="flex items-center mb-4 md:mb-0">
                                <div className="relative">
                                    <select
                                        name="sortOption"
                                        className="appearance-none bg-white/90 px-4 py-2 pr-8 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#FF2056] focus:border-[#FF2056]"
                                        value={searchParams.sortOption}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">sort by</option>
                                        <option value="price-high-low">Price (High to Low)</option>
                                        <option value="price-low-high">Price (Low to High)</option>
                                        <option value="rating-high-low">Rating (High to Low)</option>
                                    </select>
                                    <FontAwesomeIcon icon={faSort} className="absolute right-3 top-3 text-gray-400" />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="relative">
                                    <select
                                        name="roomTypeFilter"
                                        className="appearance-none bg-white/90 px-4 py-2 pr-8 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#FF2056] focus:border-[#FF2056]"
                                        value={searchParams.roomTypeFilter}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">All Room Types</option>
                                        {roomTypes?.map((type, index) => (
                                            <option key={index} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    <FontAwesomeIcon icon={faFilter} className="absolute right-3 top-3 text-gray-400" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Results Count */}
                        <motion.div
                            variants={fadeIn('up', 'spring', 0.8, 1)}
                            className="px-6 py-4 mt-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/90"
                        >
                            <h3 className="text-lg font-semibold text-gray-800">
                                {sortedHotels?.length > 0 ? (
                                    `Found ${sortedHotels.length} ${sortedHotels.length === 1 ? 'room' : 'rooms'}`
                                ) : (
                                    "No rooms match your search criteria"
                                )}
                            </h3>
                            {(appliedFilters.destination || searchParams.roomTypeFilter || searchParams.sortOption) && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {appliedFilters.destination && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="bg-[#FFEAEE] text-[#FF2056] text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                                        >
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                                            {appliedFilters.destination}
                                            <button
                                                onClick={() => {
                                                    setSearchParams(prev => ({ ...prev, destination: "" }));
                                                    setAppliedFilters(prev => ({ ...prev, destination: "" }));
                                                    setCurrentPage(1);
                                                }}
                                                className="ml-1 text-[#FF2056] hover:text-[#E61C4D]"
                                            >
                                                ×
                                            </button>
                                        </motion.span>
                                    )}
                                    {appliedFilters.checkInDate && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="bg-[#FFEAEE] text-[#FF2056] text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                                        >
                                            Check-in: {formatDate(appliedFilters.checkInDate)}
                                            <button
                                                onClick={() => {
                                                    setSearchParams(prev => ({ ...prev, checkInDate: "" }));
                                                    setAppliedFilters(prev => ({ ...prev, checkInDate: "" }));
                                                    setCurrentPage(1);
                                                }}
                                                className="ml-1 text-[#FF2056] hover:text-[#E61C4D]"
                                            >
                                                ×
                                            </button>
                                        </motion.span>
                                    )}
                                    {appliedFilters.checkOutDate && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="bg-[#FFEAEE] text-[#FF2056] text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                                        >
                                            Check-out: {formatDate(appliedFilters.checkOutDate)}
                                            <button
                                                onClick={() => {
                                                    setSearchParams(prev => ({ ...prev, checkOutDate: "" }));
                                                    setAppliedFilters(prev => ({ ...prev, checkOutDate: "" }));
                                                    setCurrentPage(1);
                                                }}
                                                className="ml-1 text-[#FF2056] hover:text-[#E61C4D]"
                                            >
                                                ×
                                            </button>
                                        </motion.span>
                                    )}
                                    {appliedFilters.totalPersons && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="bg-[#FFEAEE] text-[#FF2056] text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                                        >
                                            <FontAwesomeIcon icon={faUserFriends} className="mr-1" />
                                            {appliedFilters.totalPersons} {appliedFilters.totalPersons === "1" ? 'guest' : 'guests'}
                                            <button
                                                onClick={() => {
                                                    setSearchParams(prev => ({ ...prev, totalPersons: "" }));
                                                    setAppliedFilters(prev => ({ ...prev, totalPersons: "" }));
                                                    setCurrentPage(1);
                                                }}
                                                className="ml-1 text-[#FF2056] hover:text-[#E61C4D]"
                                            >
                                                ×
                                            </button>
                                        </motion.span>
                                    )}
                                    {searchParams.roomTypeFilter && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="bg-[#FFEAEE] text-[#FF2056] text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                                        >
                                            Room Type: {searchParams.roomTypeFilter}
                                            <button
                                                onClick={() => {
                                                    setSearchParams(prev => ({ ...prev, roomTypeFilter: "" }));
                                                    setCurrentPage(1);
                                                }}
                                                className="ml-1 text-[#FF2056] hover:text-[#E61C4D]"
                                            >
                                                ×
                                            </button>
                                        </motion.span>
                                    )}
                                    {searchParams.sortOption === "price-high-low" && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="bg-[#FFEAEE] text-[#FF2056] text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                                        >
                                            Sorted: High to Low
                                            <button
                                                onClick={() => {
                                                    setSearchParams(prev => ({ ...prev, sortOption: "" }));
                                                    setCurrentPage(1);
                                                }}
                                                className="ml-1 text-[#FF2056] hover:text-[#E61C4D]"
                                            >
                                                ×
                                            </button>
                                        </motion.span>
                                    )}
                                    {searchParams.sortOption === "price-low-high" && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="bg-[#FFEAEE] text-[#FF2056] text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                                        >
                                            Sorted: Low to High
                                            <button
                                                onClick={() => {
                                                    setSearchParams(prev => ({ ...prev, sortOption: "" }));
                                                    setCurrentPage(1);
                                                }}
                                                className="ml-1 text-[#FF2056] hover:text-[#E61C4D]"
                                            >
                                                ×
                                            </button>
                                        </motion.span>
                                    )}
                                    {searchParams.sortOption === "rating-high-low" && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="bg-[#FFEAEE] text-[#FF2056] text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                                        >
                                            Sorted: Rating
                                            <button
                                                onClick={() => {
                                                    setSearchParams(prev => ({ ...prev, sortOption: "" }));
                                                    setCurrentPage(1);
                                                }}
                                                className="ml-1 text-[#FF2056] hover:text-[#E61C4D]"
                                            >
                                                ×
                                            </button>
                                        </motion.span>
                                    )}
                                </div>
                            )}
                        </motion.div>

                        {/* Hotel Listings */}
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
                        >
                            {displayHotels.map((hotel, index) => (
                                hotel.empty ? (
                                    <div key={`empty-${index}`} className="h-0 invisible"></div>
                                ) : (
                                    <motion.div
                                        key={index}
                                        variants={cardVariants}
                                        initial="offscreen"
                                        whileInView="onscreen"
                                        viewport={{ once: true, amount: 0.2 }}
                                        className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/90 hover:border-[#FF2056]/30 transform hover:-translate-y-1"
                                    >
                                        <div className="relative h-48 overflow-hidden group">
                                            <img
                                                src={hotel.hotelImages[0]}
                                                alt={hotel.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute top-0 left-0 bg-[#FF2056] text-white px-3 py-1 text-sm font-bold rounded-br-lg">
                                                {hotel.averageRating === "No ratings" ? (
                                                    <span>New</span>
                                                ) : (
                                                    <span className="flex items-center">
                                                        <FontAwesomeIcon icon={faStar} className="text-yellow-300 mr-1" />
                                                        {hotel.averageRating}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                                <h3 className="text-white font-bold text-xl">{hotel.name}</h3>
                                                <p className="text-white/90 flex items-center">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-sm" />
                                                    {hotel.location}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="bg-[#FFEAEE] text-[#FF2056] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                    {hotel.roomDetails.type}
                                                </span>
                                                <div className="text-right">
                                                    <span className="text-lg font-bold text-gray-900">
                                                        BDT {hotel.roomDetails.pricePerNight}
                                                    </span>
                                                    <span className="block text-xs text-gray-500">per night</span>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-gray-600 mb-2 flex items-center">
                                                    <FontAwesomeIcon icon={faUserFriends} className="text-gray-500 mr-2" />
                                                    Max {hotel.roomDetails.maxOccupancy} guests
                                                </p>
                                                {hotel.roomDetails.amenities && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {hotel.roomDetails.amenities.slice(0, 4).map((amenity, idx) => (
                                                            <span key={idx} className="flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                                <FontAwesomeIcon
                                                                    icon={amenityIcons[amenity.toLowerCase()] || faBed}
                                                                    className="mr-1 text-[#FF2056] text-xs"
                                                                />
                                                                {amenity}
                                                            </span>
                                                        ))}
                                                        {hotel.roomDetails.amenities.length > 4 && (
                                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                                +{hotel.roomDetails.amenities.length - 4} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <Link
                                                to={`/hotelDetails/${hotel.id}`}
                                                state={{ hotels, hotel, roomIndex: hotel.roomIndex, checkInDate: appliedFilters.checkInDate, checkOutDate: appliedFilters.checkOutDate, totalPersons: appliedFilters.totalPersons }}
                                                className="w-full block text-center bg-gradient-to-r from-[#FF2056] to-[#FF6B8B] text-white font-medium py-2 px-4 rounded-lg transition-colors hover:shadow-md hover:from-[#E61C4D] hover:to-[#FF5277]"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </motion.div>
                                )
                            ))}
                        </motion.div>

                        {/* Pagination */}
                        {sortedHotels?.length > 0 && (
                            <motion.div
                                variants={fadeIn('up', 'spring', 1, 1)}
                                className="px-6 py-4 border-t flex flex-wrap justify-center items-center gap-2"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg ${currentPage === 1
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-[#FF2056] text-white hover:bg-[#E61C4D]"
                                        }`}
                                >
                                    First
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg ${currentPage === 1
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-[#FF2056] text-white hover:bg-[#E61C4D]"
                                        }`}
                                >
                                    Previous
                                </motion.button>

                                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <motion.button
                                            key={pageNum}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-4 py-2 rounded-lg ${currentPage === pageNum
                                                ? "bg-[#E61C4D] text-white font-bold"
                                                : "bg-[#FF2056] text-white hover:bg-[#E61C4D]"
                                                }`}
                                        >
                                            {pageNum}
                                        </motion.button>
                                    );
                                })}

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-lg ${currentPage === totalPages
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-[#FF2056] text-white hover:bg-[#E61C4D]"
                                        }`}
                                >
                                    Next
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-lg ${currentPage === totalPages
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-[#FF2056] text-white hover:bg-[#E61C4D]"
                                        }`}
                                >
                                    Last
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {selectedOption === "Vehicle" && <VehicleBooking />}
            </motion.div>
        </div>
    );
};

export default Booking;