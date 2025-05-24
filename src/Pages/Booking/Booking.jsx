import { useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import BusBooking from "./BusBooking/BusBooking";
import FlightBooking from "./FlightBooking/FlightBooking";
import { faFilter, faMagnifyingGlass, faSort, faStar, faMapMarkerAlt, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Booking = () => {
    const axioxPublic = useAxiosPublic();
    const { data: hotels, isLoading, isError } = useQuery({
        queryKey: ["hotels"],
        queryFn: async () => {
            const response = await axioxPublic.get("/hotels");
            return response.data.hotels;
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

    if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;
    if (isError) return <div className="text-red-500 text-center py-10">Error loading hotels. Please try again later.</div>;

    const itemsPerPage = 9;

    // Get unique destinations and room types
    const destinations = [...new Set(hotels?.map((hotel) => hotel.location))];
    const roomTypes = [...new Set(hotels?.flatMap(hotel => hotel.rooms.map(room => room.type)))];

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

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Options Selector */}
            <div className="flex justify-center space-x-4 mb-8">
                {["Hotel", "Bus", "Flight"].map((option) => (
                    <button
                        key={option}
                        onClick={() => setSelectedOption(option)}
                        className={`px-6 py-3 rounded-full cursor-pointer text-lg font-medium transition-all
                            ${selectedOption === option
                                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {option}
                    </button>
                ))}
            </div>

            {/* Content based on selected option */}
            {selectedOption === "Hotel" && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Search Bar */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6">
                        <form onSubmit={applyFilters}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                            {/* Destination Dropdown */}
                            <div className="relative">
                                <select
                                    name="destination"
                                    className={`w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 ${searchErrors.destination ? "ring-2 ring-red-500" : ""}`}
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
                                    <p className="absolute -bottom-5 text-xs text-red-100">{searchErrors.destination}</p>
                                )}
                            </div>

                            {/* Check-in Date */}
                            <div className="relative">
                                <input
                                    type="date"
                                    name="checkInDate"
                                    className={`w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 ${searchErrors.checkInDate ? "ring-2 ring-red-500" : ""}`}
                                    value={searchParams.checkInDate}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                                {searchErrors.checkInDate && (
                                    <p className="absolute -bottom-5 text-xs text-red-100">{searchErrors.checkInDate}</p>
                                )}
                            </div>

                            {/* Check-out Date */}
                            <div className="relative">
                                <input
                                    type="date"
                                    name="checkOutDate"
                                    className={`w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 ${searchErrors.checkOutDate ? "ring-2 ring-red-500" : ""}`}
                                    value={searchParams.checkOutDate}
                                    onChange={handleInputChange}
                                    min={searchParams.checkInDate || new Date().toISOString().split('T')[0]}
                                    required
                                />
                                {searchErrors.checkOutDate && (
                                    <p className="absolute -bottom-5 text-xs text-red-100">{searchErrors.checkOutDate}</p>
                                )}
                            </div>

                            {/* Total Persons */}
                            <div className="relative">
                                <input
                                    type="number"
                                    name="totalPersons"
                                    min="1"
                                    placeholder="Total Guests"
                                    className={`w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 ${searchErrors.totalPersons ? "ring-2 ring-red-500" : ""}`}
                                    value={searchParams.totalPersons}
                                    onChange={handleInputChange}
                                    required
                                />
                                {searchErrors.totalPersons && (
                                    <p className="absolute -bottom-5 text-xs text-red-100">{searchErrors.totalPersons}</p>
                                )}
                            </div>

                            {/* Search Button */}
                            <button
                                type="submit"
                                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-4 py-3 rounded-lg transition-all flex items-center justify-center transform hover:scale-105"
                            >
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" />
                                Search Hotels
                            </button>
                        </form>
                    </div>

                    {/* Sort and Filter Options */}
                    <div className="p-6 bg-gray-50 flex flex-wrap justify-between items-center">
                        <div className="flex items-center mb-4 md:mb-0">
                            <span className="text-gray-700 mr-3 font-medium">Sort by:</span>
                            <div className="relative">
                                <select
                                    name="sortOption"
                                    className="appearance-none bg-white px-4 py-2 pr-8 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                                    value={searchParams.sortOption}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Recommended</option>
                                    <option value="price-high-low">Price (High to Low)</option>
                                    <option value="price-low-high">Price (Low to High)</option>
                                    <option value="rating-high-low">Rating (High to Low)</option>
                                </select>
                                <FontAwesomeIcon icon={faSort} className="absolute right-3 top-3 text-gray-400" />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <span className="text-gray-700 mr-3 font-medium">Filter by:</span>
                            <div className="relative">
                                <select
                                    name="roomTypeFilter"
                                    className="appearance-none bg-white px-4 py-2 pr-8 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
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
                    </div>

                    {/* Results Count */}
                    <div className="px-6 py-4 border-b">
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
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                                        {appliedFilters.destination}
                                        <button
                                            onClick={() => {
                                                setSearchParams(prev => ({ ...prev, destination: "" }));
                                                setAppliedFilters(prev => ({ ...prev, destination: "" }));
                                                setCurrentPage(1);
                                            }}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {appliedFilters.checkInDate && (
                                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                                        Check-in: {formatDate(appliedFilters.checkInDate)}
                                        <button
                                            onClick={() => {
                                                setSearchParams(prev => ({ ...prev, checkInDate: "" }));
                                                setAppliedFilters(prev => ({ ...prev, checkInDate: "" }));
                                                setCurrentPage(1);
                                            }}
                                            className="ml-1 text-purple-600 hover:text-purple-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {appliedFilters.checkOutDate && (
                                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                                        Check-out: {formatDate(appliedFilters.checkOutDate)}
                                        <button
                                            onClick={() => {
                                                setSearchParams(prev => ({ ...prev, checkOutDate: "" }));
                                                setAppliedFilters(prev => ({ ...prev, checkOutDate: "" }));
                                                setCurrentPage(1);
                                            }}
                                            className="ml-1 text-purple-600 hover:text-purple-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {appliedFilters.totalPersons && (
                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                                        <FontAwesomeIcon icon={faUserFriends} className="mr-1" />
                                        {appliedFilters.totalPersons} {appliedFilters.totalPersons === "1" ? 'guest' : 'guests'}
                                        <button
                                            onClick={() => {
                                                setSearchParams(prev => ({ ...prev, totalPersons: "" }));
                                                setAppliedFilters(prev => ({ ...prev, totalPersons: "" }));
                                                setCurrentPage(1);
                                            }}
                                            className="ml-1 text-green-600 hover:text-green-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {searchParams.roomTypeFilter && (
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                                        Room Type: {searchParams.roomTypeFilter}
                                        <button
                                            onClick={() => {
                                                setSearchParams(prev => ({ ...prev, roomTypeFilter: "" }));
                                                setCurrentPage(1);
                                            }}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {searchParams.sortOption === "price-high-low" && (
                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                                        Sorted: High to Low
                                        <button
                                            onClick={() => {
                                                setSearchParams(prev => ({ ...prev, sortOption: "" }));
                                                setCurrentPage(1);
                                            }}
                                            className="ml-1 text-green-600 hover:text-green-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {searchParams.sortOption === "price-low-high" && (
                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                                        Sorted: Low to High
                                        <button
                                            onClick={() => {
                                                setSearchParams(prev => ({ ...prev, sortOption: "" }));
                                                setCurrentPage(1);
                                            }}
                                            className="ml-1 text-green-600 hover:text-green-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {searchParams.sortOption === "rating-high-low" && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                                        Sorted: Rating
                                        <button
                                            onClick={() => {
                                                setSearchParams(prev => ({ ...prev, sortOption: "" }));
                                                setCurrentPage(1);
                                            }}
                                            className="ml-1 text-yellow-600 hover:text-yellow-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Hotel Listings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {displayHotels.map((hotel, index) => (
                            hotel.empty ? (
                                <div key={`empty-${index}`} className="h-0 invisible"></div>
                            ) : (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={hotel.hotelImages[0]}
                                            alt={hotel.name}
                                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        />
                                        <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 text-sm font-bold">
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
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
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
                                                <p className="text-gray-600 text-sm line-clamp-2">
                                                    {hotel.roomDetails.amenities.join(', ')}
                                                </p>
                                            )}
                                        </div>

                                        <Link
                                            to={`/hotelDetails/${hotel.id}`}
                                            state={{ hotel, roomIndex: hotel.roomIndex }}
                                            className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors hover:shadow-md"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    {/* Pagination */}
                    {sortedHotels?.length > 0 && (
                        <div className="px-6 py-4 border-t flex flex-wrap justify-center items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-lg ${currentPage === 1
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                            >
                                First
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-lg ${currentPage === 1
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                            >
                                Previous
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-4 py-2 rounded-lg ${currentPage === pageNum
                                            ? "bg-blue-800 text-white font-bold"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-lg ${currentPage === totalPages
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                            >
                                Next
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-lg ${currentPage === totalPages
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                            >
                                Last
                            </button>
                        </div>
                    )}
                </div>
            )}

            {selectedOption === "Bus" && (
                <BusBooking></BusBooking>
            )}
            {selectedOption === "Flight" && (
                <FlightBooking></FlightBooking>
            )}
        </div>
    );
};

export default Booking;