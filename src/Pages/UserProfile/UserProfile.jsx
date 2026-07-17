/* eslint-disable no-undef */
import { useState, useRef } from "react";
import { ChevronRightIcon, CameraIcon } from "@heroicons/react/24/solid";
import useAuth from "../../hooks/useAuth";
import ProfileTab from "./ProfileTab/ProfileTab";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import axios from "axios";

const UserProfile = () => {
  const { loggedUser, fetchUserData } = useAuth();
  const [activeTab, setActiveTab] = useState("Profile");
  const [imageUploading, setImageUploading] = useState(false);

  const fileInputRef = useRef(null);
  const axiosSecure = useAxiosSecure();

  const tabs = ["Profile"];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setImageUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      const upload = await axios.post(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_ImagebbApiKey}`,
        formData,
      );

      const imageUrl = upload.data.data.url;

      await axiosSecure.patch(`/users/${loggedUser._id}`, {
        image: imageUrl,
      });

      await fetchUserData(loggedUser.email);

      Swal.fire({
        icon: "success",
        title: "Profile picture updated",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.log(err);

      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err.message,
      });
    } finally {
      setImageUploading(false);
    }
  };

  const handleProfileUpdate = async (updateData) => {
    const response = await axiosSecure.patch(
      `/users/${loggedUser._id}`,
      updateData,
    );

    if (response.data.modifiedCount > 0) {
      await fetchUserData(loggedUser.email);
      return true;
    }

    throw new Error("Profile update failed");
  };

 const triggerFileInput = () => {
    if (imageUploading) return;
    fileInputRef.current?.click();
};

  const renderTabContent = () => {
    switch (activeTab) {
      case "Profile":
        return (
          <ProfileTab
            user={loggedUser}
            onEdit={async (updateData) => {
              try {
                await handleProfileUpdate(updateData);
                await Swal.fire({
                  icon: "success",
                  title: "Profile updated successfully!",
                  showConfirmButton: false,
                  timer: 1500,
                });
              } catch (error) {
                Swal.fire({
                  icon: "error",
                  title: "Update failed",
                  text: error.response?.data?.message || error.message,
                });
              }
            }}
          />
        );
      default:
        return null;
    }
  };
  <ProfileTab user={loggedUser} onEdit={() => {}} />;
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
                        e.target.src =
                          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"; // Fallback image
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
                  disabled={imageUploading}
                  className="absolute bottom-2 right-0 bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  aria-label="Change profile picture"
                >
                  {imageUploading ? (
                    <svg
                      className="w-4 h-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    <CameraIcon className="w-4 h-4" />
                  )}
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
                  {loggedUser.name || "No Name Provided"}
                </h1>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    activeTab === tab
                      ? "bg-rose-50 text-rose-600"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  aria-current={activeTab === tab ? "page" : undefined}
                >
                  <span className="font-medium">{tab}</span>
                  {activeTab === tab && (
                    <ChevronRightIcon className="w-5 h-5" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content Area */}
          <main className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm p-8">
            <div className="h-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {activeTab}
              </h2>
              {renderTabContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
