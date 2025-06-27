import { useQuery } from '@tanstack/react-query';
import { ClockIcon, XCircleIcon, MapPinIcon, BuildingOfficeIcon, TicketIcon, ArrowsRightLeftIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import useAuth from '../../../hooks/useAuth';
import useAxiosPublic from '../../../hooks/useAxiosPublic';

const BookingStatusTab = () => {
    const { loggedUser } = useAuth();
    const axiosPublic = useAxiosPublic();

    const { data: bookings = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['bookings', loggedUser?.uid],
        queryFn: async () => {
            if (!loggedUser?.uid) return [];
            try {
                const res = await axiosPublic.get(`/bookings/${loggedUser.uid}`);
                return res.data;
            } catch (err) {
                console.error('Error fetching bookings:', err);
                throw err;
            }
        },
        enabled: !!loggedUser?.uid,
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });

    const handleCancelBooking = async (bookingId, checkInDate) => {
        const now = new Date();
        const checkInDateTime = new Date(checkInDate);
        const hoursUntilCheckIn = (checkInDateTime - now) / (1000 * 60 * 60);

        if (hoursUntilCheckIn < 24) {
            Swal.fire({
                icon: 'error',
                title: 'Cancellation Policy',
                text: 'Bookings cannot be cancelled within 24 hours of check-in',
                footer: '<a href="/cancellation-policy">View cancellation policy</a>'
            });
            return;
        }

        const { isConfirmed } = await Swal.fire({
            title: 'Confirm Cancellation',
            html: `
                <div class="text-left">
                    <p class="mb-2">Are you sure you want to cancel this booking?</p>
                    ${hoursUntilCheckIn < 48 ?
                    '<p class="text-amber-600">A cancellation fee may apply</p>' :
                    '<p class="text-green-600">Full refund will be processed</p>'}
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, cancel booking',
            cancelButtonText: 'Keep booking',
            reverseButtons: true
        });

        if (isConfirmed) {
            try {
                await axiosPublic.patch(`/bookings/${bookingId}/cancel`);
                await refetch();
                Swal.fire({
                    icon: 'success',
                    title: 'Cancellation Complete',
                    text: 'Your booking has been successfully cancelled',
                    showConfirmButton: false,
                    timer: 1500
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Cancellation Failed',
                    text: error.response?.data?.message || 'Please try again later',
                });
            }
        }
    };

    const renderBookingIcon = (type) => {
        switch (type) {
            case 'hotel':
                return <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />;
            case 'bus':
            case 'train':
                return <ArrowsRightLeftIcon className="h-5 w-5 text-green-500" />;
            default:
                return <TicketIcon className="h-5 w-5 text-purple-500" />;
        }
    };

    const renderBookingDetails = (booking) => {
        switch (booking.type) {
            case 'hotel':
                return (
                    <>
                        <div className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4 text-gray-500" />
                            <span>{booking.hotelLocation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <span>
                                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                ({booking.nights} nights)
                            </span>
                        </div>
                    </>
                );
            case 'bus':
            case 'train':
                return (
                    <>
                        <div className="flex items-center gap-2">
                            <ArrowsRightLeftIcon className="h-4 w-4 text-gray-500" />
                            <span>{booking.from} → {booking.dest}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <span>{new Date(booking.journeyDate).toLocaleString()}</span>
                        </div>
                    </>
                );
            default:
                return (
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span>{new Date(booking.date).toLocaleString()}</span>
                    </div>
                );
        }
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        </div>
    );

    if (isError) return (
        <div className="text-center py-12">
            <div className="inline-flex items-center justify-center bg-rose-100 rounded-full p-3 mb-4">
                <XCircleIcon className="h-8 w-8 text-rose-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Failed to load bookings</h3>
            <p className="text-gray-500 mb-4">Please try again later</p>
            <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
            >
                Retry
            </button>
        </div>
    );

    if (bookings.length === 0) return (
        <div className="text-center py-12">
            <div className="inline-flex items-center justify-center bg-blue-50 rounded-full p-3 mb-4">
                <TicketIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
            <p className="text-gray-500">You haven't made any bookings yet</p>
        </div>
    );

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Bookings</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                {bookings.map(booking => {

                    return (
                        <div key={booking._id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        {renderBookingIcon(booking.type)}
                                        <div>
                                            <h3 className="font-semibold text-gray-800 capitalize">
                                                {booking.type === 'hotel' ? booking.hotelName : booking.type === 'bus' ? booking.vehicleName : 'Other'} Booking
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Booking ID: {booking._id.slice(-8).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                        booking.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                            'bg-amber-100 text-amber-800'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    {renderBookingDetails(booking)}

                                    <div className="flex items-center gap-2">
                                        <ClockIcon className="h-4 w-4 text-gray-500" />
                                        <span>Booked on {new Date(booking.bookingTime).toLocaleString()}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />
                                        <span>Total: ${booking.totalCost?.toFixed(2)}</span>
                                    </div>

                                    {/* Show departure date if calculated */}
                                    {booking.startDate && booking.nights && (
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                                            <span>
                                                Departure: {booking.endDate instanceof Date ? booking.endDate.toLocaleDateString() : booking.endDate}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {booking.status === 'confirmed' && (
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleCancelBooking(booking._id, booking.startDate || booking.endDate || booking.date)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-rose-100 text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                                        >
                                            <XCircleIcon className="h-4 w-4" />
                                            Cancel Booking
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BookingStatusTab;