
import { PencilIcon, PlusIcon, XMarkIcon, CalendarIcon } from "@heroicons/react/24/solid";
import { useEffect, useState, useRef } from "react";
// import useAxiosSecure from "../../../hooks/useAxiosSecure";
// import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";


const ProfileTab = ({ user, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  const [loading, setLoading] = useState(false);
  
  // Standalone states for password security section
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  
  // const axiosSecure = useAxiosSecure();
  // const queryClient = useQueryClient();
  const { loggedUser } = useAuth();
  const dateInputRef = useRef(null);

  useEffect(() => {
    setEditedUser({ ...user });
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleFieldChange = (field, value) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
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
      setLoading(true);
      const { _id, ...userData } = editedUser;
      await onEdit(userData);
      setIsEditing(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to update profile",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Explicit handler dedicated entirely to secure password modification
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire("Error", "All password fields are required.", "error");
      return;
    }

    // Comprehensive Regular Expression validation structure
    // Requires: at least 6 characters, 1 uppercase letter, 1 number, and 1 special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;

    if (!passwordRegex.test(newPassword)) {
      Swal.fire({
        icon: "warning",
        title: "Weak Password",
        html: `
          <div style="text-align: left; font-size: 0.95rem; line-height: 1.5;">
            <p style="margin-bottom: 8px; font-weight: bold;">Your password must contain:</p>
            <ul style="list-style-type: disc; margin-left: 20px;">
              <li>At least <strong>6 characters</strong></li>
              <li>At least <strong>1 capital letter</strong></li>
              <li>At least <strong>1 number</strong></li>
              <li>At least <strong>1 special character</strong> (e.g. @, #, $, !)</li>
            </ul>
          </div>
        `,
        confirmButtonColor: "#f43f5e"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire("Mismatch", "New password and verification do not match.", "error");
      return;
    }

    try {
      setPassLoading(true);
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        Swal.fire("Session Expired", "Please log out and log back in.", "error");
        return;
      }

      // Step 1: Secure re-authentication verify checkpoint
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Step 2: Write fresh string to auth system payload
      await updatePassword(currentUser, newPassword);

      Swal.fire({
        icon: "success",
        title: "Password Updated",
        text: "Your security credentials have been successfully updated.",
        confirmButtonColor: "#f43f5e"
      });

      form.reset();
      setIsChangingPassword(false);
    } catch (error) {
      console.error(error);
      let message = "Failed to update credentials. Try again.";
      if (error.code === "auth/wrong-password") {
        message = "The current password you typed is incorrect.";
      }
      Swal.fire("Security Error", message, "error");
    } finally {
      setPassLoading(false);
    }
  };

  // Standard helper to strictly display dates as dd/mm/yyyy
  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "Not provided";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  return (
    <div className="space-y-10">
      {/* Basic Information Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Basic Info</h2>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1 border border-gray-300 px-3 py-1 rounded-md text-sm"
                onClick={handleDiscard}
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Discard</span>
              </button>
              <button
                className="text-rose-500 hover:text-rose-600 flex items-center gap-2 border border-rose-500 px-3 py-1 rounded-md text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <PencilIcon className="w-4 h-4" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              className="text-rose-500 hover:text-rose-600 flex items-center gap-1 text-sm font-medium"
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
                  value={editedUser.name || ""}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="text-gray-800 bg-transparent border-b border-gray-300 focus:border-rose-500 focus:outline-none"
                />
              ) : (
                <p className="text-gray-800">{editedUser.name || "Not provided"}</p>
              )}
            </div>
            {!isEditing && (
              <button
                className="text-rose-500 hover:text-rose-600 flex items-center gap-1 ml-4 text-sm"
                onClick={() => handleAddOrChange("name")}
              >
                {editedUser.name ? (
                  <><PencilIcon className="w-4 h-4" /><span>Change</span></>
                ) : (
                  <><PlusIcon className="w-4 h-4" /><span>Add</span></>
                )}
              </button>
            )}
          </div>

          {/* Gmail Field */}
          <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">GMAIL</h3>
              <p className="text-gray-800">{loggedUser.email || "Not provided"}</p>
            </div>
          </div>

          {/* Birthday Field */}
          <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">BIRTHDAY</h3>
              {isEditing ? (
                <div className="relative flex items-center border-b border-gray-300 focus-within:border-rose-500 max-w-[180px]">
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={formatDateToDDMMYYYY(editedUser.birthday)}
                    readOnly
                    onClick={() => dateInputRef.current?.showPicker()}
                    className="w-full text-gray-800 bg-transparent focus:outline-none cursor-pointer pr-7"
                  />
                  <input
                    type="date"
                    ref={dateInputRef}
                    value={editedUser.birthday || ""}
                    onChange={(e) => handleFieldChange("birthday", e.target.value)}
                    className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
                  />
                  <button
                    type="button"
                    onClick={() => dateInputRef.current?.showPicker()}
                    className="absolute right-0 text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <p className="text-gray-800">{formatDateToDDMMYYYY(editedUser.birthday)}</p>
              )}
            </div>
            {!isEditing && (
              <button
                className="text-rose-500 hover:text-rose-600 flex items-center gap-1 ml-4 text-sm"
                onClick={() => handleAddOrChange("birthday")}
              >
                {editedUser.birthday ? (
                  <><PencilIcon className="w-4 h-4" /><span>Change</span></>
                ) : (
                  <><PlusIcon className="w-4 h-4" /><span>Add</span></>
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
                  value={editedUser.gender || ""}
                  onChange={(e) => handleFieldChange("gender", e.target.value)}
                  className="text-gray-800 bg-transparent border-b border-gray-300 focus:border-rose-500 focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              ) : (
                <p className="text-gray-800">{editedUser.gender || "Not provided"}</p>
              )}
            </div>
            {!isEditing && (
              <button
                className="text-rose-500 hover:text-rose-600 flex items-center gap-1 ml-4 text-sm"
                onClick={() => handleAddOrChange("gender")}
              >
                {editedUser.gender ? (
                  <><PencilIcon className="w-4 h-4" /><span>Change</span></>
                ) : (
                  <><PlusIcon className="w-4 h-4" /><span>Add</span></>
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
                  value={editedUser.address || ""}
                  onChange={(e) => handleFieldChange("address", e.target.value)}
                  className="w-full text-gray-800 bg-transparent border-b border-gray-300 focus:border-rose-500 focus:outline-none"
                  rows={2}
                />
              ) : (
                <p className="text-gray-800">{editedUser.address || "Not provided"}</p>
              )}
            </div>
            {!isEditing && (
              <button
                className="text-rose-500 hover:text-rose-600 flex items-center gap-1 ml-4 text-sm"
                onClick={() => handleAddOrChange("address")}
              >
                {editedUser.address ? (
                  <><PencilIcon className="w-4 h-4" /><span>Change</span></>
                ) : (
                  <><PlusIcon className="w-4 h-4" /><span>Add</span></>
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
                  value={editedUser.maritalStatus || ""}
                  onChange={(e) => handleFieldChange("maritalStatus", e.target.value)}
                  className="text-gray-800 bg-transparent border-b border-gray-300 focus:border-rose-500 focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              ) : (
                <p className="text-gray-800">{editedUser.maritalStatus || "Not provided"}</p>
              )}
            </div>
            {!isEditing && (
              <button
                className="text-rose-500 hover:text-rose-600 flex items-center gap-1 ml-4 text-sm"
                onClick={() => handleAddOrChange("maritalStatus")}
              >
                {editedUser.maritalStatus ? (
                  <><PencilIcon className="w-4 h-4" /><span>Change</span></>
                ) : (
                  <><PlusIcon className="w-4 h-4" /><span>Add</span></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Standalone Separate Change Password Area */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-800">Security & Sign-In</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage your account authentication credentials</p>
          </div>
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="text-rose-500 hover:text-rose-600 flex items-center gap-1 text-sm font-medium border border-rose-200 hover:border-rose-300 px-3 py-1.5 rounded-md transition-colors"
            >
              <PencilIcon className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>
          )}
        </div>

        {isChangingPassword && (
          <form onSubmit={handlePasswordSubmit} className="bg-gray-50 p-5 rounded-lg border border-gray-200 max-w-md space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                placeholder="Enter current password"
                className="w-full text-sm px-3 py-2 bg-white border border-gray-300 rounded-md focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Requires Cap letter, Number, Special char"
                className="w-full text-sm px-3 py-2 bg-white border border-gray-300 rounded-md focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Retype new password"
                className="w-full text-sm px-3 py-2 bg-white border border-gray-300 rounded-md focus:border-rose-500 focus:outline-none"
              />
            </div>
            
            <div className="flex gap-2 pt-2 justify-end">
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passLoading}
                className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-70 text-white rounded-md text-sm font-medium flex items-center gap-2"
              >
                {passLoading ? "Updating..." : "Save Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileTab;