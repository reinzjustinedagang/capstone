import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { KeyRound, Loader2, Send } from "lucide-react"; // Import KeyRound for the icon, Loader2 for loading, Send for button icon
// import axios from "axios"; // Keep axios for actual API call

export default function ForgotPassword() {
  const [cpNumber, setCpNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    setLoading(true);
    setError(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages

    // Basic client-side validation for mobile number format
    // This is a simple regex for Philippine mobile numbers starting with 09 and 11 digits
    const mobileNumberRegex = /^09\d{9}$/;
    if (!mobileNumberRegex.test(cpNumber)) {
      setError(
        "Please enter a valid 11-digit Philippine mobile number (e.g., 09XXXXXXXXX)."
      );
      setLoading(false);
      return;
    }

    try {
      // --- Placeholder for actual API call ---
      // In a real application, you would make an API call here, e.g., using axios:
      /*
      const response = await axios.post(
        "http://localhost:3000/api/request-otp", // Ensure this URL is correct for your backend
        { cpNumber },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Important for sending cookies/sessions
        }
      );

      if (response.data.success) {
        setSuccessMessage("OTP sent successfully! Redirecting to verification...");
        localStorage.setItem("recoveryCpNumber", cpNumber); // Store number for OTP verification
        setTimeout(() => {
          navigate("/verify-otp");
        }, 1500); // Navigate after a short delay
      } else {
        setError(response.data.message || "Failed to send OTP. Please try again.");
      }
      */

      // --- Mock OTP Send Success (for demonstration) ---
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call delay

      setSuccessMessage(
        "OTP sent successfully! Redirecting to verification..."
      );
      localStorage.setItem("recoveryCpNumber", cpNumber); // Store number for OTP verification
      setTimeout(() => {
        navigate("/verify-otp");
      }, 2000); // Navigate after 2 seconds
    } catch (err) {
      console.error("OTP request error:", err);
      if (err.response) {
        setError(
          err.response.data.message ||
            "Failed to send OTP. Please check the number."
        );
      } else if (err.request) {
        setError(
          "No response from server. Please check your internet connection."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false); // Always stop loading
    }
  };

  // No need for useEffect to disable scrolling with the new layout
  // The min-h-screen and flex justify-center/items-center handle centering.

  return (
    <div className="relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 font-inter overflow-hidden">
      {/* Background animation elements - consistent with homepage and login/register pages */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 bottom-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
        <div className="text-center">
          <KeyRound className="mx-auto h-12 w-12 text-indigo-600 mb-4" />{" "}
          {/* Icon added */}
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 leading-tight">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your mobile number to receive a One-Time Password (OTP)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="cpNumber"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              Mobile Number
            </label>
            <input
              id="cpNumber"
              name="cpNumber"
              type="tel" // Use type="tel" for mobile numbers
              required
              value={cpNumber}
              onChange={(e) => setCpNumber(e.target.value)}
              placeholder="e.g., 09123456789"
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-base transition-all duration-200"
            />
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
                Sending OTP...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Send OTP
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            Back to Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
