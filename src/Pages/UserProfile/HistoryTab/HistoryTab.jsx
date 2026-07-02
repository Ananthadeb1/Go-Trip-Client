import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaHotel, FaTrain, FaBus, FaCalendarAlt, FaMoneyBillWave, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import useAuth from '../../../hooks/useAuth';

const HistoryTab = () => {
    const { loggedUser } = useAuth();
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('all'); // 'all', 'past', 'cancelled'

    // ---- 1. Resolve the user's Mongo _id from their email ----
    // Same query key as ExpenseTrackingTab's user lookup. If that tab (or
    // this one) has already fetched it this session, it's read straight
    // from cache here — no extra network round trip.
    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['user', loggedUser?.email],
        queryFn: async () => (await axiosPublic.get(`/users/${loggedUser?.email}`)).data,
        enabled: !!loggedUser?.email,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

    const userId = userData?._id || loggedUser?._id;

    // ---- 2. Bookings, cached so revisiting this tab is instant ----
    const {
        data: rawBookings = [],
        isLoading: bookingsLoading,
        isError,
    } = useQuery({
        queryKey: ['bookings', userId],
        queryFn: async () => (await axiosPublic.get(`/bookings/${userId}`)).data,
        enabled: !!userId,
        staleTime: 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

    const bookings = useMemo(
        () =>
            rawBookings.map((booking) => ({
                ...booking,
                bookingDate: booking.bookingTime ? new Date(booking.bookingTime) : null,
                startDate: booking.startDate ? new Date(booking.startDate) : null,
                endDate: booking.endDate ? new Date(booking.endDate) : null,
            })),
        [rawBookings]
    );

    const loading = userLoading || bookingsLoading;
    const error = isError ? 'Failed to load booking history' : null;

    // ---- Delete mutation — invalidates cache instead of hand-editing state ----
    const deleteMutation = useMutation({
        mutationFn: (bookingId) => axiosPublic.delete(`/bookings/${bookingId}`),
        onSuccess: () => queryClient.invalidateQueries(['bookings', userId]),
    });

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
                await deleteMutation.mutateAsync(bookingId);
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
            <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const filteredBookings = filterBookings();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                        Booking History
                    </h1>
                    <p className="text-base sm:text-lg text-rose-600">
                        View your past and cancelled bookings
                    </p>
                </div>

                {/* Filter Controls */}
                <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 flex flex-wrap gap-2">
                    {['all', 'past', 'cancelled'].map((f) => {
                        let label = f;
                        if (f === 'all') label = 'All History';
                        else if (f === 'past') label = 'Past';
                        else if (f === 'cancelled') label = 'Cancelled';

                        return (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg capitalize text-sm sm:text-base transition-colors ${filter === f
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
                                    <div className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                <div className="text-2xl shrink-0">
                                                    {getBookingIcon(booking.type)}
                                                </div>
                                                <div className="min-w-0">
                                                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                                                        {bookingName}
                                                    </h2>
                                                    <p className="text-sm text-gray-500">
                                                        ID: {booking._id.slice(-8).toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(booking.status)}`}>
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

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <FaCalendarAlt className="text-gray-400 shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Booking Date</p>
                                                        <p className="font-medium">{formatDate(booking.bookingTime ? new Date(booking.bookingTime) : null)}</p>
                                                    </div>
                                                </div>
                                                {booking.startDate && (
                                                    <div className="flex items-center gap-3">
                                                        <FaCalendarAlt className="text-gray-400 shrink-0" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Check-IN Date</p>
                                                            <p className="font-medium">{formatDate(booking.startDate)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {booking.journeyDate && (
                                                    <div className="flex items-center gap-3">
                                                        <FaCalendarAlt className="text-gray-400 shrink-0" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Travel Date</p>
                                                            <p className="font-medium">{formatDate(new Date(booking.journeyDate))}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {booking.endDate && (
                                                    <div className="flex items-center gap-3">
                                                        <FaCalendarAlt className="text-gray-400 shrink-0" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Check-Out Date</p>
                                                            <p className="font-medium">{formatDate(booking.endDate)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <FaMoneyBillWave className="text-gray-400 shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Total Cost</p>
                                                        <p className="font-medium text-lg text-gray-900">BDT {(booking.totalCost || 0).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                {booking.status === 'cancelled' && booking.refundAmount && (
                                                    <div className="flex items-center gap-3">
                                                        <FaMoneyBillWave className="text-green-400 shrink-0" />
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
                        <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
                            <div className="text-5xl sm:text-6xl mb-4">📋</div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No History Found</h3>
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