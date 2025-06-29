import React, { useState, useEffect } from 'react';
import { FaHotel, FaPlane, FaTrain, FaBus, FaShip, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import useAuth from '../../../hooks/useAuth';

const HistoryTab = () => {
    const { loggedUser } = useAuth();
    const axiosPublic = useAxiosPublic();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past', 'cancelled'

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
            default: return null;
        }
    };

    const filterBookings = () => {
        const now = new Date();
        return bookings.filter(booking => {
            // Use journeyDate if available, otherwise startDate, otherwise now
            const startDate = booking.journeyDate
                ? new Date(booking.journeyDate)
                : booking.startDate
                    ? booking.startDate
                    : now;
            const isUpcoming = startDate > now;
            const isPast = startDate <= now;

            switch (filter) {
                case 'upcoming':
                    return isUpcoming && booking.status !== 'cancelled';
                case 'past':
                    return isPast && booking.status !== 'cancelled';
                case 'cancelled':
                    return booking.status === 'cancelled';
                default: // 'all'
                    return true;
            }
        });
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
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Booking History
                    </h1>
                    <p className="text-lg text-rose-600">
                        View all your travel bookings
                    </p>
                </div>

                {/* Filter Controls */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-2">
                    {['all', 'upcoming', 'past', 'cancelled'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg capitalize ${filter === f ?
                                'bg-rose-600 text-white' :
                                'bg-gray-100 hover:bg-gray-200'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                        <p>{error}</p>
                    </div>
                )}

                {/* Bookings List */}
                {!loading && !error && (
                    <div className="space-y-4">
                        {filterBookings().length > 0 ? (
                            filterBookings().map((booking) => (
                                <div key={booking._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl">
                                                    {getBookingIcon(booking.type)}
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-800">
                                                        {booking.hotelName ? booking.hotelName : booking.vehicleName || 'Booking'}
                                                    </h2>
                                                    <p className="text-sm text-gray-500">
                                                        ID: {booking._id.slice(-8).toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                                {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <FaCalendarAlt className="text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Booking Date</p>
                                                        <p>{formatDate(booking.bookingTime ? new Date(booking.bookingTime) : null)}</p>
                                                    </div>
                                                </div>
                                                {booking.startDate && (
                                                    <div className="flex items-center gap-3">
                                                        <FaCalendarAlt className="text-gray-400" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Check-IN-Date</p>
                                                            <p>{formatDate(booking.startDate)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {booking.journeyDate && (
                                                    <div className="flex items-center gap-3">
                                                        <FaCalendarAlt className="text-gray-400" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Travel Date</p>
                                                            <p>{formatDate(new Date(booking.journeyDate))}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <FaMoneyBillWave className="text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Total Cost</p>
                                                        <p>BDT {(booking.totalCost || 0).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                                <p className="text-lg text-gray-600 mb-4">
                                    No {filter === 'all' ? '' : filter} bookings found
                                </p>
                                <button
                                    onClick={() => setFilter('all')}
                                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                                >
                                    View All Bookings
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryTab;