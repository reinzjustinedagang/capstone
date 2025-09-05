import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Loader2, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import Modal from "../UI/Modal"; // Your modal component
import Button from "../UI/Button"; // Your button component

export default function Register() {
  const navigate = useNavigate();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cp_number, setPhoneNumber] = useState("");
  const [role, setRole] = useState("staff");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Developer key state
  const [enteredKey, setEnteredKey] = useState("");
  const [validKey, setValidKey] = useState(false);
  const [verifyingKey, setVerifyingKey] = useState(false);

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState("");

  // Notification modal state
  const [showNotification, setShowNotification] = useState(false);
  const [status, setStatus] = useState(""); // "success" or "error"
  const [notificationMessage, setNotificationMessage] = useState("");

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

  // Verify developer key
  const handleVerifyKey = async () => {
    if (!enteredKey) {
      setStatus("error");
      setNotificationMessage("Please enter a developer key.");
      setShowNotification(true);
      return;
    }
    setVerifyingKey(true);
    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(
        `${backendUrl}/api/settings/save-key`,
        { key: enteredKey },
        { withCredentials: true }
      );

      if (response.data.skipped) {
        setStatus("success");
        setNotificationMessage(
          "An unused developer key exists. You can proceed."
        );
      } else {
        setStatus("error");
        setNotificationMessage(response.data.message);
      }
      setShowNotification(true);
      setValidKey(true);
    } catch (err) {
      console.error("Developer key verification failed:", err);
      setStatus("error");
      setNotificationMessage(
        err.response?.data?.message || "Failed to verify key."
      );
      setShowNotification(true);
    } finally {
      setVerifyingKey(false);
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const username = `${firstName.trim()} ${lastName.trim()}`;

    if (!firstName || !lastName || !email || !password || !cp_number) {
      setStatus("error");
      setNotificationMessage("Please fill in all fields.");
      setShowNotification(true);
      setLoading(false);
      return;
    }

    if (passwordStrength === "weak") {
      setStatus("error");
      setNotificationMessage(
        "Password is too weak. Please choose a stronger one."
      );
      setShowNotification(true);
      setLoading(false);
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL;
      await axios.post(
        `${backendUrl}/api/user/register`,
        { username, email, password, cp_number, role, devKey: enteredKey },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setStatus("success");
      setNotificationMessage(
        "Registration successful! Redirecting to login..."
      );
      setShowNotification(true);

      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setPhoneNumber("");
      setRole("staff");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Registration error:", err);
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
    <div className="relative flex items-center justify-center py-0 px-0 md:py-8 md:px-4 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 font-inter overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 bottom-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative z-10 w-full max-w-full md:max-w-lg p-8 bg-white md:rounded-xl shadow-2xl">
        {!validKey ? (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 text-center">
              Developer Access
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Enter your developer key to proceed
            </p>
            <div className="mt-6">
              <input
                type="text"
                value={enteredKey}
                onChange={(e) => setEnteredKey(e.target.value)}
                placeholder="Enter Key"
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5"
              />
              <button
                onClick={handleVerifyKey}
                disabled={verifyingKey}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md"
              >
                {verifyingKey ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Verifying...
                  </>
                ) : (
                  "Verify Key"
                )}
              </button>
              <Link
                to="/login"
                className="mt-4 block text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-lg"
              >
                Back to Login
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 text-center">
              Create Your Account
            </h2>
            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              {/* First and Last name */}
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-800 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div className="w-1/2">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-800 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-800 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="example@.com"
                  value={email}
                  autoComplete="off"
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-800 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  autoComplete="new-password"
                  placeholder="******"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordStrength(checkPasswordStrength(e.target.value));
                  }}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
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

              {/* Cellphone Number */}
              <div>
                <label
                  htmlFor="cp_number"
                  className="block text-sm font-medium text-gray-800 mb-1"
                >
                  Cellphone Number
                </label>
                <input
                  id="cp_number"
                  type="tel"
                  placeholder="e.g. 09123456789"
                  value={cp_number}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={11}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-800 mb-1"
                >
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Register
                  </>
                )}
              </button>
            </form>
            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
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
