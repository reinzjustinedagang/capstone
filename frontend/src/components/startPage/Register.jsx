import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Loader2 } from "lucide-react";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();

  // Form state
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cp_number, setPhoneNumber] = useState("");
  const [role, setRole] = useState("staff");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Developer key state
  const [enteredKey, setEnteredKey] = useState("");
  const [validKey, setValidKey] = useState(false);
  const [verifyingKey, setVerifyingKey] = useState(false);

  // Verify developer key
  const handleVerifyKey = async () => {
    if (!enteredKey) return alert("Please enter a developer key.");
    setVerifyingKey(true);
    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(
        `${backendUrl}/api/settings/save-key`,
        { key: enteredKey },
        { withCredentials: true }
      );

      if (response.data.skipped) {
        alert("An unused developer key exists. You can proceed.");
      } else {
        alert(response.data.message);
      }
      setValidKey(true);
    } catch (err) {
      console.error("Developer key verification failed:", err);
      alert(err.response?.data?.message || "Failed to verify key.");
    } finally {
      setVerifyingKey(false);
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (!username || !email || !password || !cp_number) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(
        `${backendUrl}/api/user/register`,
        { username, email, password, cp_number, role, devKey: enteredKey },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setSuccessMessage("Registration successful! Redirecting to login...");
      setUsername("");
      setEmail("");
      setPassword("");
      setPhoneNumber("");
      setRole("staff");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response) {
        setError(err.response.data.message || "Registration failed.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 font-inter overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 bottom-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
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
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-base transition-all duration-200"
              />
              <button
                onClick={handleVerifyKey}
                disabled={verifyingKey}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
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
                className="mt-4 block text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-lg transition-all duration-200"
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
            <p className="mt-2 text-sm text-gray-600 text-center">
              Register at OSCAIMS
            </p>

            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                autoComplete="off"
                onChange={(e) => setUserName(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <input
                type="tel"
                placeholder="Cellphone Number"
                value={cp_number}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option>staff</option>
                <option>admin</option>
              </select>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-all duration-300"
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
                id="login"
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
