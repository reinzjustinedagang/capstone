import React, { useState, useEffect } from "react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  UserCircle,
  SaveIcon,
  Loader2,
  CheckCircle,
  XCircle,
  MailIcon,
  PhoneCallIcon,
  UserCheck,
  Clock,
  UploadCloud,
  KeyRound,
} from "lucide-react";
import ProfilePicture from "./ProfilePicture";
import UserInfoCard from "./UserInfoCard";
import ProfileForm from "./ProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";

export default function MyProfile() {
  // State for user data
  const [userData, setUserData] = useState(null);
  // Editable fields
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [cp_number, setCpNumber] = useState(""); // Use cp_number everywhere

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null); // 'profile' or 'password'
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const [croppedImageBlob, setCroppedImageBlob] = useState(null);

  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  // --- Helper functions for notifications ---
  const showNotification = (message, type) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotificationModal(true);
  };

  const closeNotificationModal = () => {
    setShowNotificationModal(false);
    setNotificationMessage("");
  };

  const handleConfirmAction = () => {
    if (confirmationAction === "profile") {
      executeProfileSave();
    } else if (confirmationAction === "password") {
      executeChangePassword();
    }
    setConfirmationAction(null);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmationModal(false);
    setConfirmationAction(null);
    setConfirmationMessage("");
  };

  // --- Fetch User Data on Mount ---
  useEffect(() => {
    const fetchUserData = async () => {
      setFetchLoading(true);
      setFetchError("");
      try {
        const meResponse = await axios.get(`${backendUrl}/api/user/me`, {
          withCredentials: true,
        });

        if (meResponse.status === 200 && meResponse.data.isAuthenticated) {
          const fetchedData = {
            id: meResponse.data.id,
            username: meResponse.data.username,
            email: meResponse.data.email,
            cp_number: meResponse.data.cp_number,
            role: meResponse.data.role,
            last_login: meResponse.data.last_login,
            image: meResponse.data.image,
          };
          setUserData(fetchedData);
          setUserName(fetchedData.username || "");
          setEmail(fetchedData.email || "");
          setCpNumber(fetchedData.cp_number || "");
          return;
        }
        setFetchError("Not authenticated. Please log in.");
        navigate("/login");
      } catch (err) {
        console.error("User data fetch error:", err);
        if (err.response && err.response.status === 401) {
          setFetchError(
            "Session expired or not logged in. Please log in again."
          );
          navigate("/login");
        } else {
          setFetchError(
            err.response?.data?.message ||
              "An error occurred while fetching user data."
          );
        }
      } finally {
        setFetchLoading(false);
      }
    };

    fetchUserData();
  }, [backendUrl, navigate]);

  // Handler for saving profile information (triggers confirmation)
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!username || !email || !cp_number) {
      showNotification("All profile fields are required.", "error");
      return;
    }
    if (!userData || !userData.id) {
      showNotification("User ID not available. Please log in again.", "error");
      return;
    }
    setConfirmationAction("profile");
    setConfirmationMessage(
      "Are you sure you want to update your profile with these changes?"
    );
    setShowConfirmationModal(true);
  };

  // Function to execute profile save after confirmation
  const executeProfileSave = async () => {
    setShowConfirmationModal(false);
    setProfileLoading(true);
    try {
      let uploadedImageUrl = userData.image;

      // Upload image only if a new one is cropped
      if (croppedImageBlob) {
        const formData = new FormData();
        formData.append("image", croppedImageBlob);

        const uploadResponse = await axios.post(
          `${backendUrl}/api/user/upload-profile-picture/${userData.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
        uploadedImageUrl = uploadResponse.data.imageUrl;
      }

      const response = await axios.put(
        `${backendUrl}/api/user/updateProfile/${userData.id}`,
        {
          username,
          email,
          cp_number,
          image: uploadedImageUrl,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setUserData((prev) => ({
          ...prev,
          username,
          email,
          cp_number,
          image: uploadedImageUrl,
        }));
        setCroppedImageBlob(null); // Clear blob after upload
        window.dispatchEvent(new Event("profileUpdated"));
        showNotification("Profile updated successfully!", "success");
      } else {
        showNotification(
          "Failed to update profile. Please try again.",
          "error"
        );
      }
    } catch (err) {
      console.error("Profile update error:", err);
      let errorMessage =
        err.response?.data?.message ||
        "An error occurred during profile update.";
      showNotification(errorMessage, "error");
      if (err.response && err.response.status === 401) {
        navigate("/login");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Handler for changing password (triggers confirmation)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showNotification("All password fields are required.", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showNotification("New passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showNotification(
        "New password must be at least 6 characters long.",
        "error"
      );
      return;
    }
    if (!userData || !userData.id) {
      showNotification("User ID not available. Please log in again.", "error");
      return;
    }
    setConfirmationAction("password");
    setConfirmationMessage("Are you sure you want to change your password?");
    setShowConfirmationModal(true);
  };

  // Function to execute password change after confirmation
  const executeChangePassword = async () => {
    setShowConfirmationModal(false);
    setPasswordLoading(true);

    try {
      const response = await axios.put(
        `${backendUrl}/api/user/change-password/${userData.id}`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        showNotification("Password changed successfully!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        showNotification(
          "Failed to change password. Current password might be incorrect or an unknown error occurred.",
          "error"
        );
      }
    } catch (err) {
      console.error("Password change error:", err);
      let errorMessage =
        err.response?.data?.message ||
        "An error occurred during password change.";
      showNotification(errorMessage, "error");
      if (err.response && err.response.status === 401) {
        navigate("/login");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-700">
        <Loader2 className="animate-spin h-8 w-8 mr-2" /> Loading profile...
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-700 p-4 text-center">
        <XCircle className="h-8 w-8 mb-2" />
        <p>{fetchError}</p>
        <Button onClick={() => navigate("/login")} className="mt-4">
          Go to Login
        </Button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-700">
        No user data available after loading. This should not happen if login is
        successful.
      </div>
    );
  }

  return (
    <>
      {/* <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1> */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b pb-6 mb-6">
          {/* Profile Picture Section */}
          <ProfilePicture
            profilePicture={userData.image}
            onCropReady={(blob) => setCroppedImageBlob(blob)}
          />

          {/* User Basic Info */}
          <UserInfoCard userData={userData} />
        </div>
        {/* Profile Information Form */}
        <ProfileForm
          username={username}
          email={email}
          cp_number={cp_number}
          setUserName={setUserName}
          setEmail={setEmail}
          setCpNumber={setCpNumber}
          onSubmit={handleProfileSave}
          loading={profileLoading}
        />
      </div>
      {/* Change Password Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <ChangePasswordForm
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmNewPassword={confirmNewPassword}
          setCurrentPassword={setCurrentPassword}
          setNewPassword={setNewPassword}
          setConfirmNewPassword={setConfirmNewPassword}
          onSubmit={handleChangePassword}
          loading={passwordLoading}
          username={userData.username}
        />
      </div>
      {/* --- Notification Modal --- */}
      <Modal
        isOpen={showNotificationModal}
        onClose={closeNotificationModal}
        title={notificationType === "success" ? "Success!" : "Error!"}
      >
        <div className="p-6 text-center">
          {notificationType === "success" ? (
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          )}
          <div
            className={`text-lg font-semibold mb-4 ${
              notificationType === "success" ? "text-green-700" : "text-red-700"
            }`}
          >
            {notificationMessage}
          </div>
          <Button
            variant={notificationType === "success" ? "primary" : "danger"}
            onClick={closeNotificationModal}
          >
            OK
          </Button>
        </div>
      </Modal>
      {/* --- Confirmation Modal --- */}
      <Modal
        isOpen={showConfirmationModal}
        onClose={handleCancelConfirmation}
        title="Confirm Action"
      >
        <div className="p-6 text-center">
          <p className="text-lg text-gray-700 mb-6">{confirmationMessage}</p>
          <div className="flex justify-center gap-4">
            <Button variant="secondary" onClick={handleCancelConfirmation}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmAction}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
