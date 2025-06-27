import { PencilIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../../hooks/useAuth';

const ProfileTab = ({ user, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({ ...user });
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { loggedUser, fetchUserData } = useAuth()

    const handleEditClick = () => {
        setIsEditing(!isEditing);
    };

    const handleFieldChange = (field, value) => {
        setEditedUser(prev => ({ ...prev, [field]: value }));
    };

    const handleAddOrChange = () => {
        setIsEditing(true);
    };

    const handleDiscard = () => {
        setEditedUser({ ...user });
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            const { _id, ...userData } = editedUser;

            // Optimistically update the UI
            onEdit(editedUser);
            queryClient.setQueryData(['user', _id], editedUser);

            // Send the update to the server
            await axiosSecure.patch(`/users/${_id}`, userData);
            fetchUserData(loggedUser.email);

            // Confirm the update was successful
            await Swal.fire({
                icon: 'success',
                title: 'Profile updated successfully!',
                showConfirmButton: false,
                timer: 1500
            });

            // Refresh data from server to ensure consistency
            await queryClient.invalidateQueries(['user', _id]);

            setIsEditing(false);
        } catch (error) {
            // Revert the optimistic update if the API call fails
            queryClient.setQueryData(['user', user._id], user);
            onEdit(user);
            setEditedUser({ ...user });

            Swal.fire({
                icon: 'error',
                title: 'Failed to update profile.',
                text: error.message,
            });
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Basic Info</h2>
                {isEditing ? (
                    <div className="flex gap-2">
                        <button
                            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 border border-gray-300 px-3 py-1 rounded-md"
                            onClick={handleDiscard}
                        >
                            <XMarkIcon className="w-4 h-4" />
                            <span>Discard</span>
                        </button>
                        <button
                            className="text-rose-500 hover:text-rose-600 flex items-center gap-1 border border-rose-500 px-3 py-1 rounded-md"
                            onClick={handleSave}
                        >
                            <PencilIcon className="w-4 h-4" />
                            <span>Save</span>
                        </button>
                    </div>
                ) : (
                    <button
                        className="text-rose-500 hover:text-rose-600 flex items-center gap-1"
                        onClick={handleEditClick}
                    >
                        <PencilIcon className="w-4 h-4" />
                        <span>Edit</span>
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Name Field */}
                <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">NAME</h3>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedUser.name || ''}
                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                className="text-gray-800 bg-transparent border-b border-gray-300 focus:border-rose-500 focus:outline-none"
                            />
                        ) : (
                            <p className="text-gray-800">{editedUser.name || 'Not provided'}</p>
                        )}
                    </div>
                    {!isEditing && (
                        <button
                            className="text-rose-500 hover:text-rose-600 flex items-center gap-1 ml-4"
                            onClick={() => handleAddOrChange('name')}
                        >
                            {editedUser.name ? (
                                <>
                                    <PencilIcon className="w-4 h-4" />
                                    <span>Change</span>
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Add</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Birthday Field */}
                <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">BIRTHDAY</h3>
                        {isEditing ? (
                            <input
                                type="date"
                                value={editedUser.birthday || ''}
                                onChange={(e) => handleFieldChange('birthday', e.target.value)}
                                className="text-gray-800 bg-transparent border-b border-gray-300 focus:border-rose-500 focus:outline-none"
                            />
                        ) : (
                            <p className="text-gray-800">{editedUser.birthday || 'Not provided'}</p>
                        )}
                    </div>
                    {!isEditing && (
                        <button
                            className="text-rose-500 hover:text-rose-600 flex items-center gap-1 ml-4"
                            onClick={() => handleAddOrChange('birthday')}
                        >
                            {editedUser.birthday ? (
                                <>
                                    <PencilIcon className="w-4 h-4" />
                                    <span>Change</span>
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Add</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Gender Field */}
                <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">GENDER</h3>
                        {isEditing ? (
                            <select
                                value={editedUser.gender || ''}
                                onChange={(e) => handleFieldChange('gender', e.target.value)}
                                className="text-gray-800 bg-transparent border-b border-gray-300 focus:border-rose-500 focus:outline-none"
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        ) : (
                            <p className="text-gray-800">{editedUser.gender || 'Not provided'}</p>
                        )}
                    </div>
                    {!isEditing && (
                        <button
                            className="text-rose-500 hover:text-rose-600 flex items-center gap-1 ml-4"
                            onClick={() => handleAddOrChange('gender')}
                        >
                            {editedUser.gender ? (
                                <>
                                    <PencilIcon className="w-4 h-4" />
                                    <span>Change</span>
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Add</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Address Field */}
                <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">ADDRESS</h3>
                        {isEditing ? (
                            <textarea
                                value={editedUser.address || ''}
                                onChange={(e) => handleFieldChange('address', e.target.value)}
                                className="w-full text-gray-800 bg-transparent border-b border-gray-300 focus:border-rose-500 focus:outline-none"
                                rows={2}
                            />
                        ) : (
                            <p className="text-gray-800">{editedUser.address || 'Not provided'}</p>
                        )}
                    </div>
                    {!isEditing && (
                        <button
                            className="text-rose-500 hover:text-rose-600 flex items-center gap-1 ml-4"
                            onClick={() => handleAddOrChange('address')}
                        >
                            {editedUser.address ? (
                                <>
                                    <PencilIcon className="w-4 h-4" />
                                    <span>Change</span>
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Add</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Marital Status Field */}
                <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">MARITAL STATUS</h3>
                        {isEditing ? (
                            <select
                                value={editedUser.maritalStatus || ''}
                                onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
                                className="text-gray-800 bg-transparent border-b border-gray-300 focus:border-rose-500 focus:outline-none"
                            >
                                <option value="">Select</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                            </select>
                        ) : (
                            <p className="text-gray-800">{editedUser.maritalStatus || 'Not provided'}</p>
                        )}
                    </div>
                    {!isEditing && (
                        <button
                            className="text-rose-500 hover:text-rose-600 flex items-center gap-1 ml-4"
                            onClick={() => handleAddOrChange('maritalStatus')}
                        >
                            {editedUser.maritalStatus ? (
                                <>
                                    <PencilIcon className="w-4 h-4" />
                                    <span>Change</span>
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Add</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;