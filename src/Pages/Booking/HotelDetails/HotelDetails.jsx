// File: HotelDetails/HotelDetails.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

import HotelHeader from "./Components/HotelHeader/HotelHeader"
import Breadcrumbs from "./Components/Breadcrumbs/Breadcrumbs";
import ImageGallery from "./Components/ImageGallery/ImageGallery";
import Tabs from "./Components/Tabs/Tabs";
import TabContent from "./Components/TabContent/TabContent";
import BookingCard from "./Components/BookingCard/BookingCard";
import SimilarHotels from "./Components/SimilarHotels/SimilarHotels";

const HotelDetails = () => {
    const { state } = useLocation();
    const { hotels, hotel, roomIndex, checkInDate: initialCheckIn, checkOutDate: initialCheckOut, totalPersons: initialPersons } = state || {};
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
    } = useForm();

    const [startDate, setStartDate] = useState(initialCheckIn ? new Date(initialCheckIn) : null);
    const [endDate, setEndDate] = useState(initialCheckOut ? new Date(initialCheckOut) : null);
    const [guests, setGuests] = useState(initialPersons ? parseInt(initialPersons) : 1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState("overview");

    const similarHotels = hotels
        ? hotels.filter(
            (h) =>
                h.id !== hotel.id &&
                h.location === hotel.location
        ).slice(0, 4)
        : [];
    console.log("similarHotels", similarHotels);
    if (!hotel) {
        navigate("/booking");
        return null;
    }

    const selectedRoom = hotel.rooms[roomIndex];
    const roomImages = selectedRoom.roomImages || hotel.hotelImages;

    const averageRating = hotel.reviews?.length > 0
        ? (hotel.reviews.reduce((sum, review) => sum + review.rating, 0) / hotel.reviews.length).toFixed(1)
        : 0;

    const calculateNights = () => {
        if (startDate && endDate) {
            const diffTime = Math.abs(endDate - startDate);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        return 0;
    };

    const nights = calculateNights();
    const totalPrice = selectedRoom.isDiscounted
        ? selectedRoom.pricePerNight * (1 - selectedRoom.discountPercentage / 100) * nights * guests
        : selectedRoom.pricePerNight * nights * guests;

    const onSubmit = async (data) => {
        if (!startDate || !endDate) {
            Swal.fire({ icon: "error", title: "Oops...", text: "Please select check-in and check-out dates" });
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
            }).then(() => navigate("/my-bookings"));
        } catch (error) {
            Swal.fire({ icon: "error", title: "Booking Failed", text: error.message });
        }
    };

    const handleStartDateChange = (date) => {
        setStartDate(date);
        if (endDate && date > endDate) setEndDate(null);
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        if (startDate && date < startDate) setStartDate(null);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Breadcrumbs hotel={hotel} navigate={navigate} />
            <HotelHeader hotel={hotel} averageRating={averageRating} />
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3">
                    <ImageGallery
                        roomImages={roomImages}
                        activeImageIndex={activeImageIndex}
                        setActiveImageIndex={setActiveImageIndex}
                        hotel={hotel}
                        selectedRoom={selectedRoom}
                    />
                    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabContent
                        activeTab={activeTab}
                        hotel={hotel}
                        selectedRoom={selectedRoom}
                        averageRating={averageRating}
                    />
                    {similarHotels?.length > 0 && (
                        <SimilarHotels
                            similarHotels={similarHotels}
                            location={hotel.location}
                            navigate={navigate}
                            startDate={startDate}
                            endDate={endDate}
                            guests={guests}
                        />
                    )}
                </div>
                <div className="lg:w-1/3">
                    <BookingCard
                        selectedRoom={selectedRoom}
                        startDate={startDate}
                        endDate={endDate}
                        guests={guests}
                        nights={nights}
                        totalPrice={totalPrice}
                        handleStartDateChange={handleStartDateChange}
                        handleEndDateChange={handleEndDateChange}
                        setGuests={setGuests}
                        onSubmit={onSubmit}
                        register={register}
                        handleSubmit={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
};

export default HotelDetails;
