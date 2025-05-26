import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";


const UserManagement = () => {
    // const users = props.users || [];

    const axiosSecure = useAxiosSecure();
    const { data: users = [], refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await axiosSecure.get('/users');
            return res.data;
        }
    });

    const handleMakeAdmin = (user) => {
        const userId = user._id;
        console.log("Making user admin:", userId);
        axiosSecure.patch(`/users/admin/${userId}`)
            .then(res => {
                if (res.data.modifiedCount > 0) {
                    refetch();
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: `${user.name} is now an admin.`,

                    });
                } else {
                    console.log("Failed to make user admin", res.data);
                }
            })
            .catch(error => {
                console.error("Error making user admin:", error);
            });
    }
    const handleDeleteUser = (user) => {
        const userId = user._id;
        console.log("Deleting user:", userId);
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/users/${userId}`)
                    .then(res => {
                        if (res.data.deletedCount > 0) {
                            refetch();
                            Swal.fire(
                                'Deleted!',
                                `${user.name} has been deleted.`,
                                'success'
                            );
                        } else {
                            console.log("Failed to delete user", res.data);
                        }
                    })
                    .catch(error => {
                        console.error("Error deleting user:", error);
                    });
            }
        });
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full  bg-white border border-gray-200">
                <thead>
                    <tr className="bg-gray-100 text-center text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 ">Name</th>
                        <th className="py-3 px-6 ">Email</th>
                        <th className="py-3 px-6 ">Booking History</th>
                        <th className="py-3 px-6 ">Role</th>
                        <th className="py-3 px-6 ">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    {users.map((user) => (
                        <tr key={user._id} className="border-b text-center border-gray-200 hover:bg-gray-100">
                            <td className="py-3 px-6 ">{user.name}</td>
                            <td className="py-3 px-6 ">{user.email}</td>
                            <td className="py-3 px-6 ">{user.bookingHistory ? user.bookingHistory.length : 0}</td>
                            <td className="py-3 px-6 ">
                                {user.role === 'admin' ? (
                                    <span className="text-green-500 font-bold">Admin</span>
                                ) : (
                                    <button
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        onClick={() => handleMakeAdmin(user)}
                                    >
                                        Make Admin
                                    </button>
                                )}
                            </td>
                            <td className="py-3 px-6 ">
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    onClick={() => handleDeleteUser(user)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    );
};

export default UserManagement;