import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { FiUser, FiMail, FiCalendar, FiShield, FiTrash2, FiEdit } from "react-icons/fi";
import { MdAdminPanelSettings } from "react-icons/md";
import { Tooltip } from "@mui/material";
import { useEffect } from "react";
import { useState } from "react";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const UserManagement = () => {
    const axiosSecure = useAxiosSecure();
    const axiosPublic = useAxiosPublic();
    const { data: users = [], isLoading, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await axiosSecure.get('/users');
            return res.data;
        }
    });

    const [bookingCounts, setBookingCounts] = useState({});

    useEffect(() => {
        const fetchBookingCounts = async () => {
            try {
                const res = await axiosPublic.get("/bookings");
                const counts = {};
                res.data.forEach((booking) => {
                    const userId = booking.userId;
                    counts[userId] = (counts[userId] || 0) + 1;
                });
                setBookingCounts(counts);
            } catch (error) {
                console.error("Error fetching booking counts:", error);
                setBookingCounts({});
            }
        };
        fetchBookingCounts();
    }, [axiosPublic]);

    const handleMakeAdmin = (user) => {
        Swal.fire({
            title: 'Confirm Admin Promotion',
            text: `Are you sure you want to make ${user.name} an admin?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, promote!'
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.patch(`/users/admin/${user._id}`)
                    .then(res => {
                        if (res.data.modifiedCount > 0) {
                            refetch();
                            Swal.fire({
                                icon: 'success',
                                title: 'Promotion Successful!',
                                text: `${user.name} is now an admin.`,
                                timer: 2000,
                                showConfirmButton: false,
                                background: '#f9fafb',
                                backdrop: `
                                    rgba(79, 70, 229, 0.1)
                                    url("/images/confetti.gif")
                                    center top
                                    no-repeat
                                `
                            });
                        }
                    })
                    .catch(error => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Promotion Failed',
                            text: error.message,
                            background: '#f9fafb'
                        });
                    });
            }
        });
    }

    const handleDeleteUser = (user) => {
        Swal.fire({
            title: 'Confirm User Deletion',
            text: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete!',
            background: '#f9fafb',
            backdrop: `
                rgba(239, 68, 68, 0.15)
                url("/images/trash-icon.gif")
                center top
                no-repeat
            `
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/users/${user._id}`)
                    .then(res => {
                        if (res.data.deletedCount > 0) {
                            refetch();
                            Swal.fire({
                                icon: 'success',
                                title: 'Deleted!',
                                text: `${user.name} has been removed.`,
                                timer: 2000,
                                showConfirmButton: false,
                                background: '#f9fafb'
                            });
                            axiosSecure.delete(`/bookings/${user._id}`).catch(() => { });
                            axiosSecure.delete(`/itineraries/${user._id}`).catch(() => { });
                        }
                    })
                    .catch(error => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Deletion Failed',
                            text: error.message,
                            background: '#f9fafb'
                        });
                    });
            }
        });
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loader border-4 border-indigo-200 border-t-indigo-600 rounded-full w-12 h-12 animate-spin"></span>
                <span className="ml-4 text-indigo-600 font-medium">Loading users...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-gray-50">
                <p className="text-gray-600 mt-2">Manage all registered users and their permissions</p>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th scope="col" className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center">
                                    <FiUser className="mr-3" size={18} />
                                    User
                                </div>
                            </th>
                            <th scope="col" className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center">
                                    <FiMail className="mr-3" size={18} />
                                    Contact
                                </div>
                            </th>
                            <th scope="col" className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center">
                                    <FiCalendar className="mr-3" size={18} />
                                    Bookings
                                </div>
                            </th>
                            <th scope="col" className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center">
                                    <FiShield className="mr-3" size={18} />
                                    Role
                                </div>
                            </th>
                            <th scope="col" className="px-8 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-8 py-5 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden border-2 border-indigo-100">
                                            {user.image ? (
                                                <img
                                                    src={user.image}
                                                    alt={user.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                                                    <span className="text-indigo-600 font-medium text-xl">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-lg font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap">
                                    <div className="text-lg text-gray-900">{user.email}</div>
                                    <div className="text-sm text-gray-500">{user.phone || 'No phone provided'}</div>
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap">
                                    <span className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full ${bookingCounts[user._id] > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {bookingCounts[user._id] || 0} bookings
                                    </span>
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap">
                                    {user.role === 'admin' ? (
                                        <span className="px-3 py-1.5 inline-flex items-center text-sm leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                            <MdAdminPanelSettings className="mr-2" size={16} />
                                            Admin
                                        </span>
                                    ) : (
                                        <Tooltip title="Promote to admin" arrow>
                                            <button
                                                onClick={() => handleMakeAdmin(user)}
                                                className="px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center text-sm font-medium"
                                            >
                                                <FiEdit className="mr-2" size={16} />
                                                Make Admin
                                            </button>
                                        </Tooltip>
                                    )}
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                                    <Tooltip title="Delete user" arrow>
                                        <button
                                            onClick={() => handleDeleteUser(user)}
                                            className="text-red-600 hover:text-red-800 p-3 rounded-lg hover:bg-red-50 transition-colors"
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
                {users.map((user) => (
                    <div key={user._id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-indigo-100 flex-shrink-0">
                                {user.image ? (
                                    <img
                                        src={user.image}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                                        <span className="text-indigo-600 font-medium text-xl">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="text-base font-semibold text-gray-900 truncate">{user.name}</div>
                                <div className="text-xs text-gray-500">Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
                            </div>
                        </div>

                        <div className="text-sm space-y-1 text-gray-600 border-t border-b border-gray-100 py-2">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Email:</span>
                                <span className="font-medium text-gray-800 break-all pl-2">{user.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Phone:</span>
                                <span className="font-medium text-gray-800">{user.phone || 'No phone'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Bookings:</span>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${bookingCounts[user._id] > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {bookingCounts[user._id] || 0} bookings
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                {user.role === 'admin' ? (
                                    <span className="px-2.5 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                        <MdAdminPanelSettings className="mr-1" size={14} />
                                        Admin
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleMakeAdmin(user)}
                                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center text-xs font-semibold"
                                    >
                                        <FiEdit className="mr-1" size={14} />
                                        Make Admin
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <FiTrash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="px-8 py-5 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{users.length}</span> users
                </div>
                <div className="flex space-x-3">
                    <button className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                        Previous
                    </button>
                    <button className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;