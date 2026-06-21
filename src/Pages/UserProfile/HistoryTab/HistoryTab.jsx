import React, { useState, useEffect } from 'react';
import { FaHotel, FaTrain, FaBus, FaCalendarAlt, FaMoneyBillWave, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import useAuth from '../../../hooks/useAuth';

const HistoryTab = () => {
    const { loggedUser } = useAuth();
    const axiosPublic = useAxiosPublic();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'past', 'cancelled'

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axiosPublic.get(`/bookings/${loggedUser._id}`);
                setBookings(response.data.map(booking => ({
                    ...booking,
                    bookingDate: booking.bookingTime ? new Date(booking.bookingTime) : null,
                    startDate: booking.startDate ? new Date(booking.startDate) : null,
                    endDate: booking.endDate ? new Date(booking.endDate) : null
                })));
                setLoading(false);
            } catch (err) {
                setError('Failed to load booking history');
                setLoading(false);
                console.error('Error fetching bookings:', err);
            }
        };

        if (loggedUser?._id) {
            fetchBookings();
        }
    }, [loggedUser?._id, axiosPublic]);

    const getBookingIcon = (type) => {
        switch ((type || '').toLowerCase()) {
            case 'hotel': return <FaHotel className="text-blue-500" />;
            case 'train': return <FaTrain className="text-green-500" />;
            case 'bus': return <FaBus className="text-purple-500" />;
            default: return <FaHotel className="text-gray-500" />;
        }
    };

    const filterBookings = () => {
        const now = new Date();
        // First filter the bookings
        const filtered = bookings.filter(booking => {
            // Get the start/journey date
            const startDate = booking.journeyDate
                ? new Date(booking.journeyDate)
                : booking.startDate
                    ? booking.startDate
                    : null;

            // Only show past or cancelled bookings (exclude upcoming)
            const isUpcoming = startDate && startDate > now;

            // If booking is upcoming and not cancelled, exclude it
            if (isUpcoming && booking.status !== 'cancelled') {
                return false;
            }

            // Apply filter
            switch (filter) {
                case 'past':
                    return booking.status !== 'cancelled' && !isUpcoming;
                case 'cancelled':
                    return booking.status === 'cancelled';
                default: // 'all'
                    return true;
            }
        });

        // Sort from recent to oldest (most recent first)
        return filtered.sort((a, b) => {
            // Get the date to sort by (use bookingTime or startDate or journeyDate)
            const dateA = a.bookingTime || a.startDate || a.journeyDate || a.date;
            const dateB = b.bookingTime || b.startDate || b.journeyDate || b.date;

            if (!dateA) return 1;
            if (!dateB) return -1;

            return new Date(dateB) - new Date(dateA);
        });
    };

    const handleDeleteBooking = async (bookingId, bookingName) => {
        const { isConfirmed } = await Swal.fire({
            title: 'Delete Booking History',
            html: `
                <div class="text-left">
                    <p class="mb-2">Are you sure you want to delete this booking history?</p>
                    <p class="text-sm text-gray-500">Booking: <strong>${bookingName}</strong></p>
                    <p class="text-xs text-red-500 mt-2">⚠️ This action cannot be undone</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete permanently',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        });

        if (isConfirmed) {
            try {
                await axiosPublic.delete(`/bookings/${bookingId}`);
                // Remove from local state
                setBookings(bookings.filter(booking => booking._id !== bookingId));
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted Successfully',
                    text: 'Booking history has been removed',
                    showConfirmButton: false,
                    timer: 1500
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Delete Failed',
                    text: error.response?.data?.message || 'Please try again later',
                });
            }
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Date not specified';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusBadge = (booking) => {
        const now = new Date();
        const startDate = booking.journeyDate
            ? new Date(booking.journeyDate)
            : booking.startDate
                ? booking.startDate
                : null;

        if (booking.status === 'cancelled') {
            return 'Cancelled';
        }
        if (startDate && startDate < now) {
            return 'Completed';
        }
        return booking.status || 'Confirmed';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                <p>{error}</p>
            </div>
        );
    }

    const filteredBookings = filterBookings();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Booking History
                    </h1>
                    <p className="text-lg text-rose-600">
                        View your past and cancelled bookings
                    </p>
                </div>

                {/* Filter Controls */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-2">
                    {['all', 'past', 'cancelled'].map((f) => {
                        let label = f;
                        if (f === 'all') label = 'All History';
                        else if (f === 'past') label = 'Past';
                        else if (f === 'cancelled') label = 'Cancelled';

                        return (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg capitalize transition-colors ${filter === f
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => {
                            const bookingName = booking.hotelName || booking.vehicleName || 'Booking';
                            const statusText = getStatusBadge(booking);

                            return (
                                <div key={booking._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl">
                                                    {getBookingIcon(booking.type)}
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-800">
                                                        {bookingName}
                                                    </h2>
                                                    <p className="text-sm text-gray-500">
                                                        ID: {booking._id.slice(-8).toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                                    {statusText}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteBooking(booking._id, bookingName)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete history"
                                                >
                                                    <FaTrash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <FaCalendarAlt className="text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Booking Date</p>
                                                        <p className="font-medium">{formatDate(booking.bookingTime ? new Date(booking.bookingTime) : null)}</p>
                                                    </div>
                                                </div>
                                                {booking.startDate && (
                                                    <div className="flex items-center gap-3">
                                                        <FaCalendarAlt className="text-gray-400" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Check-IN Date</p>
                                                            <p className="font-medium">{formatDate(booking.startDate)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {booking.journeyDate && (
                                                    <div className="flex items-center gap-3">
                                                        <FaCalendarAlt className="text-gray-400" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Travel Date</p>
                                                            <p className="font-medium">{formatDate(new Date(booking.journeyDate))}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {booking.endDate && (
                                                    <div className="flex items-center gap-3">
                                                        <FaCalendarAlt className="text-gray-400" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Check-Out Date</p>
                                                            <p className="font-medium">{formatDate(booking.endDate)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <FaMoneyBillWave className="text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Total Cost</p>
                                                        <p className="font-medium text-lg text-gray-900">BDT {(booking.totalCost || 0).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                {booking.status === 'cancelled' && booking.refundAmount && (
                                                    <div className="flex items-center gap-3">
                                                        <FaMoneyBillWave className="text-green-400" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Refund Amount</p>
                                                            <p className="font-medium text-green-600">BDT {(booking.refundAmount || 0).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <div className="text-6xl mb-4">📋</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No History Found</h3>
                            <p className="text-gray-500 mb-4">
                                {filter === 'all'
                                    ? 'No past or cancelled bookings found'
                                    : filter === 'past'
                                        ? 'No past bookings found'
                                        : 'No cancelled bookings found'}
                            </p>
                            {filter !== 'all' && (
                                <button
                                    onClick={() => setFilter('all')}
                                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                                >
                                    View All History
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryTab;