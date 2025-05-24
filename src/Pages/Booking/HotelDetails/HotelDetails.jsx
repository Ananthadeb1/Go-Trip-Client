import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar,
    faMapMarkerAlt,
    faUserFriends,
    faWifi,
    faSwimmingPool,
    faUtensils,
    faParking,
    faSnowflake,
    faDumbbell,
    faPaw,
    faConciergeBell,
    faSpa,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const HotelDetails = () => {
    const { state } = useLocation();
    const { hotel, roomIndex, checkInDate: initialCheckIn, checkOutDate: initialCheckOut, totalPersons: initialPersons } = state || {};
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();

    // Booking form - only special requests
    const {
        register,
        handleSubmit,
    } = useForm();

    // Initialize dates from state or set to null
    const [startDate, setStartDate] = useState(initialCheckIn ? new Date(initialCheckIn) : null);
    const [endDate, setEndDate] = useState(initialCheckOut ? new Date(initialCheckOut) : null);
    const [guests, setGuests] = useState(initialPersons ? parseInt(initialPersons) : 1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState("overview");

    // Fetch similar hotels from same location
    const { data: similarHotels } = useQuery({
        queryKey: ["similarHotels", hotel?.location],
        queryFn: async () => {
            const response = await axiosPublic.get(
                `/hotels?location=${encodeURIComponent(hotel.location)}&exclude=${hotel.id}`
            );
            return response.data.hotels.filter(
                (similarHotel) => similarHotel.location === hotel.location
            );
        },
        enabled: !!hotel,
    });

    // If no hotel data, redirect back
    if (!hotel) {
        navigate("/booking");
        return null;
    }

    const selectedRoom = hotel.rooms[roomIndex];
    const roomImages = selectedRoom.roomImages || hotel.hotelImages;

    // Calculate average rating
    const averageRating =
        hotel.reviews?.length > 0
            ? (hotel.reviews.reduce((sum, review) => sum + review.rating, 0) /
                hotel.reviews.length
            ).toFixed(1)
            : 0;

    // Calculate total nights
    const calculateNights = () => {
        if (startDate && endDate) {
            const diffTime = Math.abs(endDate - startDate);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        return 0;
    };

    // Calculate total price
    const nights = calculateNights();
    const totalPrice = selectedRoom.isDiscounted
        ? selectedRoom.pricePerNight * (1 - selectedRoom.discountPercentage / 100) * nights * (guests) // Assuming children count as half for pricing
        : selectedRoom.pricePerNight * nights * (guests); // Assuming children count as half for pricing
    // Removed as it is moved to the top

    // Booking form - only special requests

    const onSubmit = async (data) => {
        if (!startDate || !endDate) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Please select check-in and check-out dates",
            });
            return;
        }

        const bookingData = {
            hotelId: hotel.id,
            roomId: selectedRoom.id,
            checkInDate: startDate.toISOString(),
            checkOutDate: endDate.toISOString(),
            guests,
            totalPrice: Math.round(totalPrice),
            specialRequests: data.specialRequests,
            status: "confirmed",
        };

        try {
            console.log("Booking data:", bookingData);
            Swal.fire({
                title: "Booking Successful!",
                text: `Your booking at ${hotel.name} has been confirmed.`,
                icon: "success",
                confirmButtonText: "View Bookings",
            }).then(() => {
                navigate("/my-bookings");
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Booking Failed",
                text: error.message,
            });
        }
    };

    // Handle date changes to prevent mismatches
    const handleStartDateChange = (date) => {
        setStartDate(date);
        // If end date is before new start date, reset end date
        if (endDate && date > endDate) {
            setEndDate(null);
        }
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        // If start date is after new end date, reset start date
        if (startDate && date < startDate) {
            setStartDate(null);
        }
    };

    // Amenity icons mapping with fallback
    const getAmenityIcon = (amenity) => {
        const lowerAmenity = amenity.toLowerCase();
        if (lowerAmenity.includes('wifi')) return faWifi;
        if (lowerAmenity.includes('pool')) return faSwimmingPool;
        if (lowerAmenity.includes('restaurant') || lowerAmenity.includes('dining')) return faUtensils;
        if (lowerAmenity.includes('parking')) return faParking;
        if (lowerAmenity.includes('ac') || lowerAmenity.includes('air conditioning')) return faSnowflake;
        if (lowerAmenity.includes('gym') || lowerAmenity.includes('fitness')) return faDumbbell;
        if (lowerAmenity.includes('pet')) return faPaw;
        if (lowerAmenity.includes('spa')) return faSpa;
        return faConciergeBell;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <nav className="flex mb-6" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                        <button
                            onClick={() => navigate("/booking")}
                            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                        >
                            Hotels
                        </button>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <svg
                                className="w-3 h-3 mx-1 text-gray-400"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 6 10"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 9 4-4-4-4"
                                />
                            </svg>
                            <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                                {hotel.name}
                            </span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* Hotel Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                <div className="flex items-center mb-4">
                    <div className="flex items-center mr-4">
                        {[...Array(5)].map((_, i) => (
                            <FontAwesomeIcon
                                key={i}
                                icon={faStar}
                                className={`${i < Math.floor(averageRating) ? "text-yellow-400" : "text-gray-300"} mr-1`}
                            />
                        ))}
                        <span className="ml-1 text-gray-600">
                            {averageRating} ({hotel.reviews?.length || 0} reviews)
                        </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                        <span>{hotel.location}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Images and Details */}
                <div className="lg:w-2/3">
                    {/* Image Gallery */}
                    <div className="mb-8">
                        <div className="relative h-96 w-full rounded-xl overflow-hidden mb-4">
                            <img
                                src={roomImages[activeImageIndex]}
                                alt={hotel.name}
                                className="w-full h-full object-cover"
                            />
                            {selectedRoom.isDiscounted && (
                                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
                                    {selectedRoom.discountPercentage}% OFF
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {roomImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImageIndex(index)}
                                    className={`h-24 rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === index
                                        ? "border-blue-500 scale-105"
                                        : "border-transparent hover:border-gray-300"
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt={`${hotel.name} view ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 border-b border-gray-200">
                        <ul className="flex flex-wrap -mb-px">
                            {["overview", "amenities", "reviews", "location"].map((tab) => (
                                <li key={tab} className="mr-2">
                                    <button
                                        onClick={() => setActiveTab(tab)}
                                        className={`inline-block p-4 border-b-2 rounded-t-lg transition-colors ${activeTab === tab
                                            ? "text-blue-600 border-blue-600"
                                            : "border-transparent hover:text-gray-600 hover:border-gray-300"
                                            }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tab Content */}
                    <div className="mb-8">
                        {activeTab === "overview" && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">About {hotel.name}</h3>
                                <p className="text-gray-700 mb-6">{hotel.description}</p>

                                <h4 className="text-lg font-semibold mb-3">Room Details</h4>
                                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h5 className="font-bold text-lg">{selectedRoom.type}</h5>
                                            <p className="text-gray-600 mb-2">
                                                {selectedRoom.size} sqm · Max {selectedRoom.maxOccupancy} guests
                                            </p>
                                            {selectedRoom.amenities?.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedRoom.amenities.slice(0, 3).map((amenity) => (
                                                        <span
                                                            key={amenity}
                                                            className="bg-white px-3 py-1 rounded-full text-sm flex items-center"
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={getAmenityIcon(amenity)}
                                                                className="mr-2 text-blue-500"
                                                            />
                                                            {amenity}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {selectedRoom.isDiscounted ? (
                                                <>
                                                    <span className="text-gray-400 line-through mr-2">
                                                        BDT {selectedRoom.pricePerNight}
                                                    </span>
                                                    <span className="text-xl font-bold text-red-600">
                                                        BDT {Math.round(
                                                            selectedRoom.pricePerNight *
                                                            (1 - selectedRoom.discountPercentage / 100)
                                                        )}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-xl font-bold text-gray-900">
                                                    BDT {selectedRoom.pricePerNight}
                                                </span>
                                            )}
                                            <div className="text-sm text-gray-500">per night</div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700">{selectedRoom.description}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === "amenities" && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Hotel Amenities</h3>
                                {hotel.amenities?.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {hotel.amenities.map((amenity) => (
                                            <div
                                                key={amenity}
                                                className="bg-white p-4 rounded-lg border border-gray-200 flex items-center"
                                            >
                                                <FontAwesomeIcon
                                                    icon={getAmenityIcon(amenity)}
                                                    className="text-blue-500 mr-3 text-xl"
                                                />
                                                <span>{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No hotel amenities listed</p>
                                )}

                                <h3 className="text-xl font-semibold mt-8 mb-4">Room Amenities</h3>
                                {selectedRoom.amenities?.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {selectedRoom.amenities.map((amenity) => (
                                            <div
                                                key={amenity}
                                                className="bg-white p-4 rounded-lg border border-gray-200 flex items-center"
                                            >
                                                <FontAwesomeIcon
                                                    icon={getAmenityIcon(amenity)}
                                                    className="text-blue-500 mr-3 text-xl"
                                                />
                                                <span>{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No room amenities listed</p>
                                )}
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-semibold">
                                        Guest Reviews ({hotel.reviews?.length || 0})
                                    </h3>
                                    <div className="bg-blue-100 px-4 py-2 rounded-full flex items-center">
                                        <FontAwesomeIcon
                                            icon={faStar}
                                            className="text-yellow-400 mr-2"
                                        />
                                        <span className="font-bold">{averageRating} out of 5</span>
                                    </div>
                                </div>

                                {hotel.reviews?.length > 0 ? (
                                    <div className="space-y-6">
                                        {hotel.reviews.map((review, index) => (
                                            <div key={index} className="border-b pb-6">
                                                <div className="flex justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-semibold">{review.userName}</h4>
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            {new Date(review.date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FontAwesomeIcon
                                                                key={i}
                                                                icon={faStar}
                                                                className={`${i < review.rating ? "text-yellow-400" : "text-gray-300"} mr-1`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <h5 className="font-medium mb-2">{review.title}</h5>
                                                <p className="text-gray-700">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-gray-500">
                                        No reviews yet. Be the first to review!
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "location" && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Location</h3>
                                <div className="bg-gray-100 rounded-lg overflow-hidden mb-6 h-64">
                                    <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                        <div className="text-center">
                                            <FontAwesomeIcon
                                                icon={faMapMarkerAlt}
                                                className="text-red-500 text-4xl mb-2"
                                            />
                                            <p className="font-semibold">{hotel.name}</p>
                                            <p className="text-gray-600">{hotel.address}</p>
                                        </div>
                                    </div>
                                </div>
                                <h4 className="font-semibold mb-2">Nearby Attractions</h4>
                                {hotel.nearbyAttractions?.length > 0 ? (
                                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                        {hotel.nearbyAttractions.map((attraction, index) => (
                                            <li key={index}>{attraction}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">
                                        No nearby attractions information available
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Similar Hotels */}
                    {similarHotels?.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Similar Hotels in {hotel.location}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {similarHotels.slice(0, 3).map((similarHotel) => (
                                    <div
                                        key={similarHotel.id}
                                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() =>
                                            navigate(`/hotelDetails/${similarHotel.id}`, {
                                                state: {
                                                    hotel: similarHotel,
                                                    roomIndex: 0,
                                                    checkInDate: startDate?.toISOString(),
                                                    checkOutDate: endDate?.toISOString(),
                                                    totalPersons: guests,
                                                },
                                            })
                                        }
                                    >
                                        <div className="h-40 overflow-hidden">
                                            <img
                                                src={similarHotel.hotelImages[0]}
                                                alt={similarHotel.name}
                                                className="w-full h-full object-cover transition-transform hover:scale-110 duration-300"
                                            />
                                        </div>
                                        <div className="p-3">
                                            <h4 className="font-semibold line-clamp-1">
                                                {similarHotel.name}
                                            </h4>
                                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                                <FontAwesomeIcon
                                                    icon={faMapMarkerAlt}
                                                    className="mr-1 text-xs"
                                                />
                                                <span>{similarHotel.location}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <FontAwesomeIcon
                                                        icon={faStar}
                                                        className="text-yellow-400 mr-1 text-xs"
                                                    />
                                                    <span className="text-sm font-medium">
                                                        {similarHotel.reviews?.length > 0
                                                            ? (
                                                                similarHotel.reviews.reduce(
                                                                    (sum, review) => sum + review.rating,
                                                                    0
                                                                ) / similarHotel.reviews.length
                                                            ).toFixed(1)
                                                            : "New"}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold">
                                                        BDT {similarHotel.rooms[0].pricePerNight}
                                                    </span>
                                                    <div className="text-xs text-gray-500">per night</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Booking Card */}
                <div className="lg:w-1/3">
                    <div className="sticky top-4">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="bg-blue-700 text-white p-4">
                                <h3 className="font-bold text-xl">Book Your Stay</h3>
                                {selectedRoom.isDiscounted && (
                                    <div className="bg-yellow-400 text-gray-900 inline-block px-2 py-1 rounded text-xs font-bold mt-1">
                                        Limited Time Offer: {selectedRoom.discountPercentage}% OFF
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold">Your Selection:</span>
                                        {selectedRoom.isDiscounted ? (
                                            <div className="text-right">
                                                <span className="text-gray-400 line-through text-sm">
                                                    BDT {selectedRoom.pricePerNight}
                                                </span>
                                                <span className="ml-2 font-bold text-red-600">
                                                    BDT{" "}
                                                    {Math.round(
                                                        selectedRoom.pricePerNight *
                                                        (1 - selectedRoom.discountPercentage / 100)
                                                    )}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="font-bold">
                                                BDT {selectedRoom.pricePerNight}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                        {selectedRoom.type} Room
                                    </div>
                                    <div className="text-sm text-gray-600 flex items-center">
                                        <FontAwesomeIcon
                                            icon={faUserFriends}
                                            className="mr-1 text-xs"
                                        />
                                        Max {selectedRoom.maxOccupancy} guests
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Check-in Date
                                            </label>
                                            <DatePicker
                                                selected={startDate}
                                                onChange={handleStartDateChange}
                                                minDate={new Date()}
                                                selectsStart
                                                startDate={startDate}
                                                endDate={endDate}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                placeholderText="Select check-in"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Check-out Date
                                            </label>
                                            <DatePicker
                                                selected={endDate}
                                                onChange={handleEndDateChange}
                                                minDate={startDate || new Date()}
                                                selectsEnd
                                                startDate={startDate}
                                                endDate={endDate}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                placeholderText="Select check-out"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Total Guests
                                            </label>
                                            <select
                                                value={guests}
                                                onChange={(e) => setGuests(parseInt(e.target.value))}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {[1, 2, 3, 4, 5].map((num) => (
                                                    <option key={num} value={num}>
                                                        {num} {num === 1 ? 'Guest' : 'Guests'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {(startDate && endDate) && (
                                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                        <div className="flex justify-between mb-2">
                                            <span>
                                                {selectedRoom.isDiscounted ? (
                                                    <>
                                                        <span className="text-gray-400 line-through mr-1">
                                                            BDT {selectedRoom.pricePerNight}
                                                        </span>
                                                        <span>
                                                            BDT {Math.round(
                                                                selectedRoom.pricePerNight *
                                                                (1 - selectedRoom.discountPercentage / 100)
                                                            )}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span>BDT {selectedRoom.pricePerNight}</span>
                                                )}
                                                {' '}x {nights} night{nights !== 1 ? 's' : ''} x {guests} person{guests !== 1 ? 's' : ''}
                                            </span>
                                            <span>
                                                BDT {Math.round(totalPrice)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between font-bold border-t pt-2">
                                            <span>Total</span>
                                            <span>BDT {Math.round(totalPrice)}</span>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <h4 className="font-semibold mb-3">Special Requests</h4>
                                    <div className="mb-4">
                                        <textarea
                                            {...register("specialRequests")}
                                            placeholder="Any special requests or notes for your stay (optional)"
                                            rows="3"
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!startDate || !endDate}
                                        className={`w-full py-3 px-4 rounded-lg transition-colors duration-300 font-bold ${!startDate || !endDate
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700 text-white"
                                            }`}
                                    >
                                        {!startDate || !endDate ? "Select Dates to Book" : "Confirm Booking"}
                                    </button>
                                </form>

                                <div className="mt-4 text-xs text-gray-500">
                                    <p>
                                        By completing this booking, you agree to our Terms of Service
                                        and Privacy Policy.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Hotel Policies */}
                        <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                            <h3 className="font-bold text-lg mb-3">Hotel Policies</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start">
                                    <svg
                                        className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        ></path>
                                    </svg>
                                    <span>
                                        <strong>Cancellation:</strong> Free cancellation up to 24 hours
                                        before check-in.
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <svg
                                        className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        ></path>
                                    </svg>
                                    <span>
                                        <strong>Check-in:</strong> From 2:00 PM. Early check-in
                                        subject to availability.
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <svg
                                        className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        ></path>
                                    </svg>
                                    <span>
                                        <strong>Check-out:</strong> Until 12:00 PM. Late check-out
                                        may incur additional charges.
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <svg
                                        className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                        ></path>
                                    </svg>
                                    <span>
                                        <strong>Payment:</strong> Credit card required to guarantee
                                        reservation.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelDetails;