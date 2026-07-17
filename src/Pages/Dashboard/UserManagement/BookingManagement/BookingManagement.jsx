import { useQuery } from "@tanstack/react-query";
import { FiCalendar, FiUser, FiMapPin, FiDollarSign, FiTrash2 } from "react-icons/fi";
import { Tooltip } from "@mui/material";
import Swal from "sweetalert2";
import useAxiosPublic from "../../../../hooks/useAxiosPublic";

const BookingManagement = () => {
    const axiosPublic = useAxiosPublic()
    const { data: bookings = [], isLoading, refetch } = useQuery({
        queryKey: ['bookings'],
        queryFn: async () => {
            const res = await axiosPublic.get('/bookings');
            return res.data;
        }
    });
    console.log("boo", bookings)

    const handleDeleteBooking = (booking) => {
        Swal.fire({
            title: 'Confirm Deletion',
            text: `Delete booking for ${booking.type}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPublic.delete(`/bookings/${booking._id}`)
                    .then(() => {
                        // Optimistically update UI
                        refetch({ cancelRefetch: true });
                        Swal.fire('Deleted!', 'Booking has been removed.', 'success');
                    })
                    .catch(error => Swal.fire('Error', error.message, 'error'));
            }
        });
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <span className="loader border-4 border-indigo-200 border-t-indigo-600 rounded-full w-12 h-12 animate-spin"></span>
            <span className="ml-4 text-indigo-600 font-medium">Loading bookings...</span>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-gray-50">
                <h2 className="text-2xl font-bold text-gray-800">Booking Management</h2>
                <p className="text-gray-600 mt-2">Manage all tour bookings and reservations</p>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                <div className="flex items-center">
                                    <FiCalendar className="mr-3" size={18} />
                                    Tour
                                </div>
                            </th>
                            <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                <div className="flex items-center">
                                    <FiUser className="mr-3" size={18} />
                                    User
                                </div>
                            </th>
                            <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                <div className="flex items-center">
                                    <FiMapPin className="mr-3" size={18} />
                                    Details
                                </div>
                            </th>
                            <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                                <div className="flex items-center">
                                    <FiDollarSign className="mr-3" size={18} />
                                    Payment
                                </div>
                            </th>
                            <th className="px-8 py-4 text-right text-sm font-semibold text-gray-700 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map(booking => (
                            <tr key={booking._id} className="hover:bg-gray-50">
                                <td className="px-8 py-5">
                                    <div className="font-medium text-gray-900">{booking.hotelLocation ? booking.hotelLocation : booking.dest}</div>
                                    <div className="text-sm text-gray-500">
                                        {(() => {
                                            const dateVal = booking.startDate || booking.journeyDate || booking.bookingTime;
                                            return dateVal ? new Date(dateVal).toLocaleDateString() : 'N/A';
                                        })()}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-gray-900">{booking.userName}</div>
                                    <div className="text-sm text-gray-500">{booking.userEmail}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-900">{booking.guests ? booking.guests : booking.passengers} guests</span>
                                        <span className="text-sm text-gray-500">{booking.status || 'Confirmed'}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="font-semibold text-indigo-600">৳{booking.totalCost || 0}</div>
                                    <div className={`text-xs font-medium ${booking.status?.toLowerCase() === "confirmed" ? 'text-green-600' : 'text-amber-600'}`}>
                                        {booking.status?.toLowerCase() === "confirmed" ? 'Paid' : 'Canceled'}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <Tooltip title="Delete booking" arrow>
                                        <button
                                            onClick={() => handleDeleteBooking(booking)}
                                            className="text-red-600 hover:text-red-800 p-3 rounded-lg hover:bg-red-50"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </Tooltip>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View (No Horizontal Scroll) */}
            <div className="block lg:hidden p-4 space-y-4">
                {bookings.map(booking => (
                    <div key={booking._id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-semibold text-gray-900">{booking.hotelLocation ? booking.hotelLocation : booking.dest}</div>
                                <div className="text-xs text-gray-500">
                                    {(() => {
                                        const dateVal = booking.startDate || booking.journeyDate || booking.bookingTime;
                                        return dateVal ? new Date(dateVal).toLocaleDateString() : 'N/A';
                                    })()}
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${booking.status?.toLowerCase() === "confirmed" ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                {booking.status?.toLowerCase() === "confirmed" ? 'Paid' : 'Canceled'}
                            </span>
                        </div>

                        <div className="text-sm space-y-1 text-gray-600 border-t border-b border-gray-100 py-2">
                            <div className="flex justify-between">
                                <span className="text-gray-400">User Name:</span>
                                <span className="font-medium text-gray-800">{booking.userName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">User Email:</span>
                                <span className="font-medium text-gray-800 break-all pl-2">{booking.userEmail}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Guests:</span>
                                <span className="font-medium text-gray-800">{booking.guests ? booking.guests : booking.passengers} guests</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-xs text-gray-400 block">Total Cost:</span>
                                <span className="font-bold text-indigo-600">৳{booking.totalCost || 0}</span>
                            </div>
                            <button
                                onClick={() => handleDeleteBooking(booking)}
                                className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                            >
                                <FiTrash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="px-8 py-5 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{bookings.length}</span> bookings
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
                        Previous
                    </button>
                    <button className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingManagement;