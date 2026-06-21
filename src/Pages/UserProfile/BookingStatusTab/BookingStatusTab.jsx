import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ClockIcon, XCircleIcon, MapPinIcon, BuildingOfficeIcon, TicketIcon, ArrowsRightLeftIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import { useState, useMemo, useEffect } from 'react';
import useAuth from '../../../hooks/useAuth';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import { Link } from 'react-router-dom';

const BookingStatusTab = () => {
    const { loggedUser } = useAuth();
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every minute to check for expired bookings
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    // Refetch data when the component mounts or when the user changes
    useEffect(() => {
        if (loggedUser?._id) {
            // Invalidate the query to ensure fresh data
            queryClient.invalidateQueries(['bookings', loggedUser._id]);
        }
    }, [loggedUser?._id, queryClient]);

    const { data: bookings = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['bookings', loggedUser?._id],
        queryFn: async () => {
            if (!loggedUser?.uid) return [];
            try {
                const res = await axiosPublic.get(`/bookings/${loggedUser._id}`);
                return res.data;
            } catch (err) {
                console.error('Error fetching bookings:', err);
                throw err;
            }
        },
        enabled: !!loggedUser?._id,
        staleTime: 1000 * 60 * 5,
        retry: 2,
        // Add refetch on window focus to catch new bookings
        refetchOnWindowFocus: true,
        // Refetch when the component mounts
        refetchOnMount: true,
    });

    // Filter out cancelled and expired bookings (only show active ones)
    const activeBookings = useMemo(() => {
        return bookings.filter(booking => {
            // Check if booking is cancelled
            const isCancelled = booking.status === 'cancelled' || booking.status === 'Canceled';
            if (isCancelled) return false;

            // Get the check-in/start date or journey date
            let bookingDate = booking.startDate || booking.journeyDate || booking.date;

            // If no date available, keep it as active
            if (!bookingDate) return true;

            const bookingDateTime = new Date(bookingDate);

            // Check if booking is expired (date has passed)
            const isExpired = bookingDateTime < currentTime;

            // Only show if not expired
            return !isExpired;
        });
    }, [bookings, currentTime]);

    // Filter active bookings based on filter
    const filteredBookings = activeBookings.filter(booking => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'hotel') return booking.type === 'hotel';
        if (activeFilter === 'vehicle') return booking.type === 'bus' || booking.type === 'train';
        return true;
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
                // Invalidate and refetch queries
                await queryClient.invalidateQueries(['bookings', loggedUser?._id]);
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
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-500">Location</span>
                            <span className="text-gray-900 ml-auto">{booking.hotelLocation || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 col-span-1 sm:col-span-2">
                            <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-500">Check-IN Date</span>
                            <span className="text-gray-900 ml-auto">
                                {booking.startDate ?
                                    new Date(booking.startDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }) :
                                    'N/A'}
                            </span>
                        </div>
                        {booking.endDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 col-span-1 sm:col-span-2">
                                <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="text-gray-500">Check-Out Date</span>
                                <span className="text-gray-900 ml-auto">
                                    {new Date(booking.endDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}
                        {booking.nights && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 col-span-1 sm:col-span-2">
                                <span className="text-gray-500">Nights</span>
                                <span className="text-gray-900 ml-auto">{booking.nights} nights</span>
                            </div>
                        )}
                    </>
                );
            case 'bus':
            case 'train':
                return (
                    <>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ArrowsRightLeftIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-500">Route</span>
                            <span className="text-gray-900 ml-auto">{booking.from || 'N/A'} → {booking.dest || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 col-span-1 sm:col-span-2">
                            <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-500">Journey Date</span>
                            <span className="text-gray-900 ml-auto">
                                {booking.journeyDate ?
                                    new Date(booking.journeyDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }) :
                                    'N/A'}
                            </span>
                        </div>
                        {booking.journeyTime && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 col-span-1 sm:col-span-2">
                                <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="text-gray-500">Departure Time</span>
                                <span className="text-gray-900 ml-auto">{booking.journeyTime}</span>
                            </div>
                        )}
                    </>
                );
            default:
                return (
                    <div className="flex items-center gap-2 text-sm text-gray-600 col-span-1 sm:col-span-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-500">Date</span>
                        <span className="text-gray-900 ml-auto">
                            {booking.date ?
                                new Date(booking.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                }) :
                                'N/A'}
                        </span>
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
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Data Available</h3>
            <p className="text-gray-500 mb-4">Book Something to look data</p>
            <Link to={"/booking"}>
                <button className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors">
                    Bookings
                </button>
            </Link>
        </div>
    );

    if (activeBookings.length === 0) return (
        <div className="text-center py-12">
            <div className="inline-flex items-center justify-center bg-blue-50 rounded-full p-3 mb-4">
                <TicketIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No active bookings</h3>
            <p className="text-gray-500">You don't have any upcoming bookings</p>
            <Link to="/booking">
                <button className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors">
                    Book Now
                </button>
            </Link>
        </div>
    );

    return (
        <div className="px-4 md:px-6 lg:px-8 space-y-6">
            {/* Header */}
            <div className="mb-6 pt-4 md:pt-8">
                <h2 className="text-2xl font-bold text-gray-900">Booking Status</h2>
                <p className="text-sm text-gray-500 mt-1">View all your upcoming bookings</p>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 md:gap-4 border-b border-gray-200 pb-3 overflow-x-auto">
                <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeFilter === 'all'
                        ? 'text-rose-600 border-b-2 border-rose-600 -mb-[1px]'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    All ({activeBookings.length})
                </button>
                <button
                    onClick={() => setActiveFilter('hotel')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeFilter === 'hotel'
                        ? 'text-rose-600 border-b-2 border-rose-600 -mb-[1px]'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Hotels ({activeBookings.filter(b => b.type === 'hotel').length})
                </button>
                <button
                    onClick={() => setActiveFilter('vehicle')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeFilter === 'vehicle'
                        ? 'text-rose-600 border-b-2 border-rose-600 -mb-[1px]'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Vehicles ({activeBookings.filter(b => b.type === 'bus' || b.type === 'train').length})
                </button>
            </div>

            {/* Booking Cards */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                {filteredBookings.map(booking => {
                    const isCancelled = booking.status === 'cancelled' || booking.status === 'Canceled';

                    return (
                        <div key={booking._id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 md:p-5">
                                {/* Header with name and status */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        {renderBookingIcon(booking.type)}
                                        <div>
                                            <h3 className="font-semibold text-gray-800 capitalize">
                                                {booking.type === 'hotel' ? booking.hotelName : booking.type === "bus" ? booking.vehicleName : booking.type === "train" ? booking.vehicleName : 'Other'}
                                            </h3>
                                            <p className="text-xs text-gray-400 font-mono">
                                                ID: {booking._id.slice(-8).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${isCancelled
                                        ? 'bg-red-50 text-red-600 border border-red-200'
                                        : 'bg-green-50 text-green-600 border border-green-200'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>

                                {/* Booking Details - Grid Layout */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mb-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-500">Booking Date</span>
                                        <span className="text-gray-900 ml-auto">
                                            {booking.bookingTime ?
                                                new Date(booking.bookingTime).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                }) :
                                                'N/A'}
                                        </span>
                                    </div>

                                    {renderBookingDetails(booking)}

                                    <div className="flex items-center gap-2 text-sm text-gray-600 col-span-1 sm:col-span-2">
                                        <CurrencyDollarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-500">Total Cost</span>
                                        <span className="text-gray-900 font-semibold ml-auto">
                                            BDT {booking.totalCost?.toFixed(2) || '0.00'}
                                        </span>
                                    </div>
                                </div>

                                {/* Cancel Button - Only show for confirmed bookings */}
                                {!isCancelled && booking.status === 'confirmed' && (
                                    <div className="flex justify-end pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => handleCancelBooking(
                                                booking._id,
                                                booking.startDate || booking.journeyDate || booking.date
                                            )}
                                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
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