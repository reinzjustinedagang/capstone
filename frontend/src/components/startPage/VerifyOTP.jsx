import React, { useState } from "react";
// import axios from "axios"; // Keep axios for actual API call
import { useNavigate, Link } from "react-router-dom"; // Import Link
import { CheckCircle, Loader2 } from "lucide-react"; // Changed MessageSquareCheck to CheckCircle, Import Loader2 for loading spinner

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  // Retrieve the mobile number from localStorage
  const cpNumber = localStorage.getItem("recoveryCpNumber");

  const handleVerify = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    setLoading(true);
    setError(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages

    // Basic client-side validation for OTP length
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP code.");
      setLoading(false);
      return;
    }

    // Check if cpNumber is available
    if (!cpNumber) {
      setError(
        "Mobile number not found. Please go back to forgot password page."
      );
      setLoading(false);
      return;
    }

    try {
      // --- Placeholder for actual API call ---
      // In a real application, you would make an API call here, e.g., using axios:
      /*
      const response = await axios.post(
        "http://localhost:3000/api/verify-otp", // Ensure this URL is correct for your backend
        {
          cpNumber,
          otp,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Important for sending cookies/sessions
        }
      );

      if (response.data.success) {
        setSuccessMessage("OTP verified successfully! Redirecting to reset password...");
        // Optionally clear the recoveryCpNumber from localStorage after successful verification
        // localStorage.removeItem("recoveryCpNumber");
        setTimeout(() => {
          navigate("/reset-password"); // Proceed to password reset page
        }, 1500); // Navigate after a short delay
      } else {
        setError(response.data.message || "Invalid OTP. Please try again.");
      }
      */

      // --- Mock OTP Verification Success (for demonstration) ---
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call delay

      // Simulate successful verification
      if (otp === "123456") {
        // Example OTP for testing
        setSuccessMessage(
          "OTP verified successfully! Redirecting to reset password..."
        );
        localStorage.removeItem("recoveryCpNumber"); // Clear after successful verification
        setTimeout(() => {
          navigate("/reset-password"); // Proceed to password reset page
        }, 2000); // Navigate after 2 seconds
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      if (err.response) {
        setError(
          err.response.data.message ||
            "OTP verification failed. Please try again."
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

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 font-inter overflow-hidden">
      {/* Background animation elements - consistent with other auth pages */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 bottom-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-indigo-600 mb-4" />{" "}
          {/* Icon changed to CheckCircle */}
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 leading-tight">
            Verify OTP
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit OTP sent to your mobile number:
            <br />
            <span className="font-semibold text-gray-900">
              {cpNumber || "N/A"}
            </span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              OTP Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              } // Allow only digits, max 6
              minLength="6"
              maxLength="6"
              pattern="\d{6}" // HTML5 pattern for 6 digits
              inputMode="numeric" // Suggest numeric keyboard on mobile
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-200"
              placeholder="______" // Placeholder for OTP
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
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />{" "}
                {/* Icon changed to CheckCircle */}
                Verify OTP
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Didn't receive the OTP?{" "}
          <Link
            to="/forgot-password"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            Resend or Change Number
          </Link>
        </p>
      </div>
    </div>
  );
}
