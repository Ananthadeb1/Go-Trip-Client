import { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserFriends } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PaymentModal from './PaymentModal/PaymentModal';
import ReviewModal from './ReviewModal/ReviewModal';

const BookingCard = ({
    selectedRoom,
    startDate,
    endDate,
    guests,
    nights,
    totalPrice,
    handleStartDateChange,
    handleEndDateChange,
    setGuests,
    onSubmit,
    register,
    handleSubmit,
    hotelid,
}) => {
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activePaymentMethod, setActivePaymentMethod] = useState(null);
    const [specialRequests, setSpecialRequests] = useState("");
    // Handle form submission to open payment modal
    const handleBookingSubmit = (data) => {
        setPaymentModalOpen(true);
        if (onSubmit) {
            setSpecialRequests(data.specialRequests);
            console.log("Special Requests:", specialRequests);
            onSubmit(data);

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
                    nights={nights}
                    guests={guests}
                    totalPrice={totalPrice}
                    selectedRoom={selectedRoom}
                    startDate={startDate}
                    endDate={endDate}
                    hotelid={hotelid}
                    roomtype={selectedRoom.type}
                    specialRequests={specialRequests}
                />
            )}
            {reviewModalOpen && (
                <ReviewModal
                    setReviewModalOpen={setReviewModalOpen}
                    selectedRoom={selectedRoom}
                />
            )}

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#FF2056] text-white p-4">
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
                                    <span className="ml-2 font-bold text-[#FF2056]">
                                        BDT {Math.round(selectedRoom.pricePerNight * (1 - selectedRoom.discountPercentage / 100))}
                                    </span>
                                </div>
                            ) : (
                                <span className="font-bold text-[#FF2056]">
                                    BDT {selectedRoom.pricePerNight}
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                            {selectedRoom.type} Room
                        </div>
                        <div className="text-sm text-gray-600 flex items-center">
                            <FontAwesomeIcon icon={faUserFriends} className="mr-1 text-xs" />
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
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#FF2056] focus:border-[#FF2056]"
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
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#FF2056] focus:border-[#FF2056]"
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
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#FF2056] focus:border-[#FF2056]"
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
                        <div className="bg-[#FFEAEE] p-4 rounded-lg mb-6">
                            <div className="flex justify-between mb-2">
                                <span>
                                    {selectedRoom.isDiscounted ? (
                                        <>
                                            <span className="text-gray-400 line-through mr-1">
                                                BDT {selectedRoom.pricePerNight}
                                            </span>
                                            <span className="text-[#FF2056]">
                                                BDT {Math.round(selectedRoom.pricePerNight * (1 - selectedRoom.discountPercentage / 100))}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-[#FF2056]">BDT {selectedRoom.pricePerNight}</span>
                                    )} x {nights} night{nights !== 1 ? 's' : ''} x {guests} person{guests !== 1 ? 's' : ''}
                                </span>
                                <span className="text-[#FF2056]">
                                    BDT {Math.round(totalPrice)}
                                </span>
                            </div>
                            <div className="flex justify-between font-bold border-t border-[#FF2056]/30 pt-2">
                                <span>Total</span>
                                <span className="text-[#FF2056]">BDT {Math.round(totalPrice)}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(handleBookingSubmit)}>
                        <h4 className="font-semibold mb-3">Special Requests</h4>
                        <div className="mb-4">
                            <textarea
                                {...register("specialRequests")}
                                placeholder="Any special requests or notes for your stay (optional)"
                                rows="3"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#FF2056] focus:border-[#FF2056]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!startDate || !endDate}
                            className={`w-full py-3 px-4 rounded-lg transition-colors duration-300 font-bold ${!startDate || !endDate
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-[#FF2056] hover:bg-[#E61C4D] text-white shadow-md hover:shadow-lg"
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
        </div>
    );
};

export default BookingCard;