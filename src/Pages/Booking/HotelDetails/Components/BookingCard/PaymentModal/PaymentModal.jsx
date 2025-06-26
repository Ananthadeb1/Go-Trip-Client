import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard, faCheckCircle, faBolt, faTimes } from "@fortawesome/free-solid-svg-icons";
import useAxiosSecure from "../../../../../../hooks/useAxiosSecure";
import useAuth from "../../../../../../hooks/useAuth";
import Swal from 'sweetalert2';

const PaymentModal = ({
    bookingSuccess,
    setBookingSuccess,
    setPaymentModalOpen,
    setReviewModalOpen,
    paymentError,
    setPaymentError,
    isProcessing,
    setIsProcessing,
    activePaymentMethod,
    setActivePaymentMethod,
    nights,
    guests,
    totalPrice,
    selectedRoom,
    startDate,
    hotelid,
    roomtype,
    specialRequests,
    hotelName,
    hotelLocation
}) => {
    const paymentMethods = [
        {
            id: 'credit_card',
            name: 'Credit Card',
            icon: faCreditCard,
            color: '#FF2056',
            textColor: '#FF2056'
        },
        {
            id: 'bkash',
            name: 'bKash',
            icon: faBolt,
            color: '#E2136E',
            textColor: '#E2136E'
        },
        {
            id: 'nagad',
            name: 'Nagad',
            icon: faBolt,
            color: '#F8A51B',
            textColor: '#F8A51B'
        }
    ];

    const AxiosSecure = useAxiosSecure();
    const { loggedUser } = useAuth();

    const processPayment = async (method) => {
        return new Promise((resolve, reject) => {
            setIsProcessing(true);
            setActivePaymentMethod(method);

            setTimeout(() => {
                const isSuccess = Math.random() < 0.9;
                setIsProcessing(false);

                if (isSuccess) {
                    resolve({
                        success: true,
                        transactionId: 'TXN_' + Math.random().toString(36).substr(2, 12).toUpperCase(),
                        paymentMethod: method,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    reject(new Error(`Payment failed: ${method === 'credit_card' ? 'Insufficient funds' : 'Service unavailable'}`));
                }
            }, 2000);
        });
    };

    const handlePaymentSuccess = async (paymentResult) => {
        try {
            const bookingData = {
                userId: loggedUser.uid,
                hotelId: hotelid,
                hotelName: hotelName,
                hotelLocation: hotelLocation,
                type: 'hotel',
                roomType: roomtype,
                startDate: startDate.toISOString(),
                nights,
                guests,
                totalPrice,
                paymentMethod: paymentResult.paymentMethod,
                transactionId: paymentResult.transactionId,
                bookingTime: new Date().toISOString(),
                status: 'confirmed',
                specialRequests: specialRequests || '',
            };

            await AxiosSecure.post('/bookings', bookingData);

            Swal.fire({
                position: 'top',
                icon: 'success',
                title: 'Payment Successful!',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                toast: true,
                background: '#fff',
                color: '#333'
            });

            setBookingSuccess(true);
        } catch (err) {
            console.error('Booking error:', err);
            setPaymentError('Failed to save booking. Please try again.');
        }
    };

    return (
        <div>
            {/* Blur overlay */}
            <div className="fixed inset-0 z-[99]  bg-opacity-50 backdrop-blur-lg"></div>
            {/* Modal */}
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
                <div className="bg-gradient-to-r from-[#FEF0F2] to-[#EEF2FF] rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl relative">
                    {!bookingSuccess ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-800">Complete Payment</h3>
                                <button
                                    onClick={() => {
                                        setPaymentModalOpen(false);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            {paymentError && (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
                                    <p>{paymentError}</p>
                                </div>
                            )}

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Total Amount</span>
                                    <span className="font-bold text-lg text-[#FF2056]">BDT {totalPrice}</span>
                                </div>
                                <div className="text-xs text-gray-500 mb-4">
                                    {nights} night{nights !== 1 ? 's' : ''} • {guests} guest{guests !== 1 ? 's' : ''}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-700">Select Payment Method</h4>
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={async () => {
                                            try {
                                                setPaymentError(null);
                                                const paymentResult = await processPayment(method.id);
                                                await handlePaymentSuccess(paymentResult);
                                            } catch (error) {
                                                setPaymentError(error.message);
                                            }
                                        }}
                                        disabled={isProcessing}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            border: `2px solid ${isProcessing ? '#e5e7eb' : method.color}`,
                                            backgroundColor: isProcessing ? '#f3f4f6' : 'white',
                                            transition: 'all 0.3s ease',
                                            cursor: isProcessing ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={method.icon}
                                            className="text-lg mr-3"
                                            style={{ color: isProcessing ? '#9ca3af' : method.color }}
                                        />
                                        <span
                                            className="font-medium"
                                            style={{ color: isProcessing ? '#9ca3af' : method.textColor }}
                                        >
                                            {method.name}
                                        </span>
                                        {isProcessing && activePaymentMethod === method.id && (
                                            <div
                                                className="ml-auto w-5 h-5 border-2 border-[#FF2056] border-t-transparent rounded-full animate-spin"
                                                style={{ borderColor: method.color, borderTopColor: 'transparent' }}
                                            ></div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {isProcessing && (
                                <div className="pt-2">
                                    <p className="text-sm text-gray-500 text-center">
                                        Processing {activePaymentMethod === 'credit_card' ? 'credit card' : activePaymentMethod} payment...
                                    </p>
                                </div>
                            )}

                            <div className="text-xs text-gray-400 text-center mt-4">
                                <p>Your payment is secured with SSL encryption</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-4">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-green-500 mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Booking Confirmed!</h3>
                            <p className="text-gray-600 mb-6">
                                Your reservation at {selectedRoom?.hotelName || "the hotel"} is confirmed
                            </p>

                            <div className="bg-[#FFEAEE] p-4 rounded-lg mb-6 text-left">
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-600">Booking ID:</span>
                                    <span className="font-mono">BK{Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-600">Check-in:</span>
                                    <span>{new Date(startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Paid:</span>
                                    <span className="font-bold text-[#FF2056]">BDT {totalPrice}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setPaymentModalOpen(false);
                                    setReviewModalOpen(true);
                                }}
                                className="w-full bg-[#FF2056] text-white py-3 px-4 rounded-lg font-bold hover:bg-[#E61C4D] transition-colors shadow-md"
                            >
                                Continue to Review
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;