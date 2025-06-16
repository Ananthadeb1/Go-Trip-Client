/* eslint-disable no-undef */
import { useState, useRef } from 'react';
import { ChevronRightIcon, PencilIcon, PlusIcon, CameraIcon } from '@heroicons/react/24/solid';
import useAuth from '../../hooks/useAuth';
import Itinerary from './Itinerary/Itinerary';
import ProfileTab from './ProfileTab/ProfileTab';
import BookingStatusTab from './BookingStatusTab/BookingStatusTab';
import HistoryTab from './HistoryTab/HistoryTab';
import ExpenseTrackingTab from './ExpenseTrackingTab/ExpenseTrackingTab';
import RecommendationTab from './RecommendationTab/RecommendationTab';
import PrivacyTab from './PrivacyTab/PrivacyTab';

const UserProfile = () => {
    const { loggedUser } = useAuth();
    const [activeTab, setActiveTab] = useState('Profile');
    const [updatedUser, setUpdatedUser] = useState({ ...loggedUser });
    const fileInputRef = useRef(null);

    const tabs = [
        'Profile',
        'Privacy',
        'Itinerary',
        'Booking Status',
        'History',
        'Expense Tracking',
        'Recommendation',
        'Log out'
    ];

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // 1. Upload to imgbb
            const formData = new FormData();
            formData.append('image', file);

            try {
                const imgbbApiKey = process.env.ImagebbApiKey; // Replace with your actual imgbb API key
                const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();
                if (data.success) {
                    const imageUrl = data.data.url;
                    setUpdatedUser({ ...updatedUser, image: imageUrl });

                    // 2. Upload the image URL to your database (example API call)
                    await fetch('/api/user/update-profile-image', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId: updatedUser.id, image: imageUrl }),
                    });
                }
            } catch (error) {
                console.error('Image upload failed:', error);
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleEditProfile = () => {
        // Save updated profile logic
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Profile':
                return <ProfileTab user={updatedUser} onEdit={handleEditProfile} />;
            case 'Privacy':
                return <PrivacyTab />;
            case 'Itinerary':
                return <Itinerary trips={[]} />;
            case 'Booking Status':
                return <BookingStatusTab />;
            case 'History':
                return <HistoryTab />;
            case 'Expense Tracking':
                return <ExpenseTrackingTab />;
            case 'Recommendation':
                return <RecommendationTab />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-rose-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar - Navigation with Profile */}
                    <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm p-6">
                        {/* Profile Picture and Name */}
                        <div className="flex flex-col items-center mb-8 relative group">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-4">
                                    {updatedUser.image ? (
                                        <img src={updatedUser.image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <CameraIcon className="w-10 h-10" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={triggerFileInput}
                                    className="absolute bottom-2 right-0 bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 transition-colors"
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
                                <h1 className="text-2xl font-bold text-gray-800">{updatedUser.name}</h1>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${activeTab === tab ? 'bg-rose-50 text-rose-600' : 'hover:bg-gray-50 text-gray-700'}`}
                                >
                                    <span className="font-medium">{tab}</span>
                                    {activeTab === tab && <ChevronRightIcon className="w-5 h-5" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm p-8">
                        <div className="h-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">{activeTab}</h2>
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;