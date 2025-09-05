import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  Loader2,
  CheckCircle,
  XCircle,
  PlusCircle,
  SaveIcon,
} from "lucide-react";
import axios from "axios";
import Modal from "../UI/Modal";
import Button from "../UI/Button";

export default function AddUser() {
  const navigate = useNavigate();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cp_number, setPhoneNumber] = useState("");
  const [role, setRole] = useState("staff");

  const [loading, setLoading] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState("");

  // Notification modal
  const [showNotification, setShowNotification] = useState(false);
  const [status, setStatus] = useState(""); // "success" | "error"
  const [notificationMessage, setNotificationMessage] = useState("");

  // Password strength checker
  const checkPasswordStrength = (pwd) => {
    if (!pwd) return "";
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const mediumRegex =
      /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*\d))|((?=.*[A-Z])(?=.*\d)))[A-Za-z\d@$!%*?&]{6,}$/;

    if (strongRegex.test(pwd)) return "strong";
    if (mediumRegex.test(pwd)) return "medium";
    return "weak";
  };

  // Handle add user
  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    const username = `${firstName.trim()} ${lastName.trim()}`;

    if (!firstName || !lastName || !email || !password || !cp_number) {
      setStatus("error");
      setNotificationMessage("Please fill in all required fields.");
      setShowNotification(true);
      setLoading(false);
      return;
    }

    if (passwordStrength === "weak") {
      setStatus("error");
      setNotificationMessage("Password is too weak. Choose a stronger one.");
      setShowNotification(true);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setNotificationMessage("Passwords do not match.");
      setShowNotification(true);
      setLoading(false);
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL;
      await axios.post(
        `${backendUrl}/api/user/register`,
        { username, email, password, cp_number, role },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setStatus("success");
      setNotificationMessage("User added successfully!");
      setShowNotification(true);

      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPhoneNumber("");
      setRole("staff");

      setTimeout(() => navigate("/admin/users"), 2000);
    } catch (err) {
      console.error("Add user error:", err);
      setStatus("error");
      setNotificationMessage(
        err.response?.data?.message || "An unexpected error occurred."
      );
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="">
        <h1 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-indigo-600" /> Add New User
        </h1>

        <form onSubmit={handleAddUser} className="mt-6 space-y-6">
          {/* First + Last name */}
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

          {/* Password */}
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="******"
                value={password}
                autoComplete="new-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordStrength(checkPasswordStrength(e.target.value));
                }}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5"
              />
              {password && (
                <p
                  className={`text-sm mt-1 ${
                    passwordStrength === "weak"
                      ? "text-red-500"
                      : passwordStrength === "medium"
                      ? "text-yellow-500"
                      : "text-green-600"
                  }`}
                >
                  Password strength: {passwordStrength}
                </p>
              )}
            </div>

            {/* Confirm Password */}
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
              {confirmPassword && confirmPassword !== password && (
                <p className="text-sm text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>
          </div>

          {/* Phone */}

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

            {/* Role */}
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

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} variant="primary">
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Adding...
                </>
              ) : (
                <>
                  <SaveIcon className="h-5 w-5" />
                  Add User
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

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
