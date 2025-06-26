/* eslint-disable no-undef */
import { useState, useRef } from 'react';
import { ChevronRightIcon, CameraIcon } from '@heroicons/react/24/solid';
import useAuth from '../../hooks/useAuth';
import Itinerary from './Itinerary/Itinerary';
import ProfileTab from './ProfileTab/ProfileTab';
import BookingStatusTab from './BookingStatusTab/BookingStatusTab';
import HistoryTab from './HistoryTab/HistoryTab';
import ExpenseTrackingTab from './ExpenseTrackingTab/ExpenseTrackingTab';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';

const UserProfile = () => {
    const { loggedUser, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('Profile');
    const [userData, setUserData] = useState(loggedUser);

    const fileInputRef = useRef(null);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const tabs = [
        'Profile',
        'Itinerary',
        'Booking Status',
        'History',
        'Expense Tracking',
    ];

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // 1. Show temporary image immediately
            const tempUrl = URL.createObjectURL(file);
            updateUser({ ...loggedUser, image: tempUrl });

            // 2. Upload to imgBB
            const formData = new FormData();
            formData.append('image', file);

            const imgbbResponse = await axiosSecure.post(
                `https://api.imgbb.com/1/upload?key=${process.env.ImagebbApiKey}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (imgbbResponse.data.success) {
                const imageUrl = imgbbResponse.data.data.url;

                // 3. Update database with permanent URL
                await handleProfileUpdate({ image: imageUrl });

                await Swal.fire({
                    icon: 'success',
                    title: 'Profile picture updated!',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            // Revert on error
            updateUser(loggedUser);

            Swal.fire({
                icon: 'error',
                title: 'Upload failed',
                text: error.response?.data?.message || error.message,
            });
            console.error('Image upload failed:', error);
        }
    };

    const handleProfileUpdate = async (updateData) => {
        // Use TanStack Query's mutation for updating user profile
        const mutation = queryClient.getMutationCache().build(
            queryClient,
            {
                mutationKey: ['updateUser', loggedUser._id],
                mutationFn: async (updateData) => {
                    const response = await axiosSecure.patch(`/users/${loggedUser._id}`, updateData);
                    if (response.data.modifiedCount === 1) {
                        return { ...loggedUser, ...updateData };
                    }
                    throw new Error('No documents were modified');
                },
                onMutate: async (updateData) => {
                    // Optimistically update UI
                    const previousUser = queryClient.getQueryData(['user', loggedUser._id]);
                    const updatedUser = { ...loggedUser, ...updateData };
                    updateUser(updatedUser);
                    setUserData(updatedUser);
                    console.log('Optimistically updating user data:', userData);
                    queryClient.setQueryData(['user', loggedUser._id], updatedUser);
                    return { previousUser };
                },
                onError: (error, _variables, context) => {
                    // Revert on error
                    updateUser(context.previousUser);
                    setUserData(context.previousUser);
                    queryClient.setQueryData(['user', loggedUser._id], context.previousUser);
                },
                onSuccess: async (data) => {
                    setUserData(data);
                    await queryClient.refetchQueries({ queryKey: ['user', loggedUser._id] });
                }
            },
            updateData
        );
        await mutation.execute(updateData);
        return true;
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };


    const renderTabContent = () => {
        switch (activeTab) {
            case 'Profile':
                return (
                    <ProfileTab
                        user={loggedUser}
                        onEdit={async (updateData) => {
                            try {
                                await handleProfileUpdate(updateData);
                                await Swal.fire({
                                    icon: 'success',
                                    title: 'Profile updated successfully!',
                                    showConfirmButton: false,
                                    timer: 1500
                                });
                            } catch (error) {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Update failed',
                                    text: error.response?.data?.message || error.message,
                                });
                            }
                        }}
                    />
                );
            case 'Itinerary':
                return <Itinerary trips={[]} />;
            case 'Booking Status':
                return <BookingStatusTab />;
            case 'History':
                return <HistoryTab />;
            case 'Expense Tracking':
                return <ExpenseTrackingTab />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar - Navigation with Profile */}
                    <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm p-6">
                        {/* Profile Picture and Name */}
                        <div className="flex flex-col items-center mb-8 relative group">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-4">
                                    {loggedUser.image ? (
                                        <img
                                            src={loggedUser.image}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"; // Fallback image
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <CameraIcon className="w-10 h-10" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={triggerFileInput}
                                    className="absolute bottom-2 right-0 bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 transition-colors"
                                    aria-label="Change profile picture"
                                >
                                    <CameraIcon className="w-4 h-4" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-800">
                                    {loggedUser.name || 'No Name Provided'}
                                </h1>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${activeTab === tab
                                        ? 'bg-rose-50 text-rose-600'
                                        : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                    aria-current={activeTab === tab ? 'page' : undefined}
                                >
                                    <span className="font-medium">{tab}</span>
                                    {activeTab === tab && <ChevronRightIcon className="w-5 h-5" />}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Right Content Area */}
                    <main className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm p-8">
                        <div className="h-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">{activeTab}</h2>
                            {renderTabContent()}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;