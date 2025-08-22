import React, { useState } from "react";
import Header from "./Header"; // Assuming Header is in the same directory
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Loader2 } from "lucide-react"; // Import UserPlus for register icon, Loader2 for loading spinner
import axios from "axios"; // Keep axios for actual API call

export default function Register() {
  const navigate = useNavigate();
  // State for form inputs
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cp_number, setPhoneNumber] = useState("");
  const [role, setRole] = useState("Staff");
  // State for loading and error messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    setLoading(true);
    setError(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages

    // Basic client-side validation
    if (!username || !email || !password || !cp_number) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // Password strength validation (example: minimum 6 characters)
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL;

      const response = await axios.post(
        `${backendUrl}/api/user/register`, // Ensure this URL is correct for your backend
        { username, email, password, cp_number, role },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Important for sending cookies/sessions
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Registration successful! You can now log in.");
        // Clear form fields on success
        setUserName("");
        setEmail("");
        setPassword("");
        setRole("");
        // Optionally navigate to login after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 2000); // Navigate after 2 seconds
      } else {
        // Handle non-2xx responses from the server
        setError(
          response.data.message || "Registration failed. Please try again."
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      // More specific error messages for network issues or server errors
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(
          err.response.data.message ||
            "Registration failed. Please check your details."
        );
      } else if (err.request) {
        // The request was made but no response was received
        setError(
          "No response from server. Please check your internet connection."
        );
      } else {
        // Something else happened in setting up the request that triggered an Error
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false); // Always stop loading, regardless of success or failure
    }
  };

  return (
    <>
      <Header />

      <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 font-inter overflow-hidden">
        {/* Background animation elements - consistent with homepage and login page */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 bottom-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
          <div className="text-center">
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 leading-tight">
              Create Your Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Register at OSCAIMS
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label
                htmlFor="userName"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                User Name
              </label>
              <input
                id="userName"
                name="userName"
                type="text"
                required
                autoComplete="name"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-base transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-base transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-base transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="cp-number"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                Cellphone Number
              </label>
              <input
                id="cp-number"
                name="cp-number"
                type="tel" // Use type="tel" for phone numbers
                required
                autoComplete="tel" // Use autoComplete="tel" for phone numbers
                value={cp_number} // Bind to the new phoneNumber state
                onChange={(e) => setPhoneNumber(e.target.value)} // Use the new handler
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-base transition-all duration-200"
                placeholder="e.g., 09171234567" // Add a helpful placeholder
                inputMode="numeric" // Suggest numeric keyboard on mobile devices
                pattern="[0-9]{11}" // Optional: Basic pattern for 11 digits
                maxLength="11" // Enforce max length at browser level
              />
            </div>

            <div>
              <label
                htmlFor="smsProvider"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                Role
              </label>
              <select
                id="smsProvider"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-base transition-all duration-200"
              >
                <option>staff</option>
                <option>admin</option>
              </select>
            </div>

            {/* Error Message Display */}
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Success Message Display */}
            {successMessage && (
              <div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative"
                role="alert"
              >
                <span className="block sm:inline">{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading} // Disable button when loading
              className={`
                w-full flex items-center justify-center gap-2
                bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md
                transition-all duration-300 ease-in-out transform hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                ${loading ? "opacity-70 cursor-not-allowed" : ""}
              `}
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
        </div>
      </div>
    </>
  );
}
