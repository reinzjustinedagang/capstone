import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  CheckCircle,
  XCircle,
  SaveIcon,
  EditIcon,
} from "lucide-react";
import axios from "axios";
import Modal from "../UI/Modal";
import Button from "../UI/Button";

export default function UpdateUser({ id, onSuccess, onCancel }) {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cp_number, setPhoneNumber] = useState("");
  const [role, setRole] = useState("staff");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [showNotification, setShowNotification] = useState(false);
  const [status, setStatus] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  // For self-role change detection
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [originalRole, setOriginalRole] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        const backendUrl = import.meta.env.VITE_API_BASE_URL;
        const { data } = await axios.get(`${backendUrl}/api/user/user/${id}`, {
          withCredentials: true,
        });
        if (data) {
          const fullName = data.username;
          const lastSpaceIndex = fullName.lastIndexOf(" ");
          const first = fullName.substring(0, lastSpaceIndex); // everything before last space
          const last = fullName.substring(lastSpaceIndex + 1); // last word
          setFirstName(first);
          setLastName(last);
          setEmail(data.email);
          setPhoneNumber(data.cp_number);
          setRole(data.role);
          setOriginalRole(data.role);
        }
      } catch (err) {
        setStatus("error");
        setNotificationMessage("Failed to fetch user data.");
        setShowNotification(true);
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    const username = `${firstName.trim()} ${lastName.trim()}`;
    const payload = { username, email, cp_number, role };
    if (password) payload.password = password;

    if (!firstName || !lastName || !email || !cp_number) {
      setStatus("error");
      setNotificationMessage("Please fill in all required fields.");
      setShowNotification(true);
      setLoading(false);
      return;
    }
    if (password && password !== confirmPassword) {
      setStatus("error");
      setNotificationMessage("Passwords do not match.");
      setShowNotification(true);
      setLoading(false);
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL;
      // Match the UserManagement payload structure
      const payload = {
        username,
        email,
        cp_number,
        role,
      };
      if (password) {
        payload.password = password;
      }

      // Use the same endpoint as UserManagement for consistency
      await axios.put(`${backendUrl}/api/user/update/${id}`, payload, {
        withCredentials: true,
      });

      // If current user changes their role, log out and redirect
      if (
        currentUser.id &&
        parseInt(currentUser.id) === parseInt(id) &&
        role !== originalRole
      ) {
        try {
          await axios.post(`${backendUrl}/api/user/logout`, {
            withCredentials: true,
          });
        } catch (logoutError) {
          // Proceed anyway
        } finally {
          localStorage.clear();
          sessionStorage.clear();
          navigate("/login");
          return;
        }
      }

      setStatus("success");
      setNotificationMessage("User updated successfully!");
      setShowNotification(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setStatus("error");
      setNotificationMessage(
        err.response?.data?.message || "An unexpected error occurred."
      );
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
        <span className="ml-2">Loading user...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <EditIcon className="w-6 h-6 text-indigo-600" /> Update User
      </h1>

      <form onSubmit={handleUpdateUser} className="mt-6 space-y-6">
        {/* First + Last Name */}
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-800 mb-1">
              First Name
            </label>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5"
            />
          </div>
        </div>

        {/* Email */}
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            autoComplete="off"
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5"
          />
        </div>

        {/* Password (optional) */}
        {/* <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-800 mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="******"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="******"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5"
            />
          </div>
        </div> */}

        {/* Phone + Role */}
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Cellphone Number
            </label>
            <input
              type="tel"
              placeholder="09123456789"
              value={cp_number}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={11}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>

          <Button type="submit" disabled={loading} variant="primary">
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Updating...
              </>
            ) : (
              <>
                <SaveIcon className="h-5 w-5" />
                Update User
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Notification Modal */}
      <Modal
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        title="Status"
      >
        <div className="p-6 text-center flex flex-col items-center gap-4">
          {status === "success" ? (
            <CheckCircle className="w-12 h-12 text-green-500" />
          ) : (
            <XCircle className="w-12 h-12 text-red-500" />
          )}

          <h3 className="text-lg font-medium text-gray-800">
            {status === "success" ? "Success" : "Failed"}
          </h3>

          <p className="text-sm text-gray-600 text-center">
            {notificationMessage}
          </p>

          <Button variant="primary" onClick={() => setShowNotification(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
}
