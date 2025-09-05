import React, { useState, useEffect } from "react";
import Header from "./Header";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Loader2, EyeIcon, EyeOffIcon, Lock } from "lucide-react";
import axios from "axios";
import Modal from "../UI/Modal";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔒 Max attempt state
  const maxAttempts = 3;
  const lockDuration = 30 * 1000; // 30 seconds
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [unlockTime, setUnlockTime] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [devKey, setDevKey] = useState("");
  const [showDevModal, setShowDevModal] = useState(false);

  // ✅ Load attempts & lock state from localStorage
  useEffect(() => {
    const storedAttempts = localStorage.getItem("loginAttempts");
    const storedUnlockTime = localStorage.getItem("unlockTime");

    if (storedAttempts) setAttempts(parseInt(storedAttempts, 10));
    if (storedUnlockTime) {
      const unlockTimestamp = parseInt(storedUnlockTime, 10);
      if (Date.now() < unlockTimestamp) {
        setLocked(true);
        setUnlockTime(unlockTimestamp);
      } else {
        localStorage.removeItem("unlockTime");
      }
    }
  }, []);

  // ⏳ Check unlock time every second
  useEffect(() => {
    if (!locked || !unlockTime) return;

    const interval = setInterval(() => {
      const secondsLeft = Math.max(
        0,
        Math.ceil((unlockTime - Date.now()) / 1000)
      );
      setRemainingSeconds(secondsLeft);

      if (secondsLeft <= 0) {
        setLocked(false);
        setAttempts(0);
        setUnlockTime(null);
        localStorage.removeItem("unlockTime");
        localStorage.setItem("loginAttempts", "0");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [locked, unlockTime]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (locked) return;
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(
        `${backendUrl}/api/user/login`,
        { email, password },
        { withCredentials: true }
      );
      setPassword("");

      const { user } = response.data;
      localStorage.setItem("user", JSON.stringify(user));

      if (user && user.role) {
        const role = user.role.toLowerCase();
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "staff") {
          navigate("/staff/dashboard");
        } else {
          setError("Login successful, but user role not recognized.");
          navigate("/");
        }
      } else {
        setError("Login successful, but user role not found.");
      }

      // ✅ Reset attempts on success
      setAttempts(0);
      localStorage.setItem("loginAttempts", "0");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );

      // ❌ Increase attempts on failure
      setAttempts((prev) => {
        const newAttempts = prev + 1;
        localStorage.setItem("loginAttempts", newAttempts.toString());

        if (newAttempts >= maxAttempts) {
          const lockUntil = Date.now() + lockDuration;
          setLocked(true);
          setUnlockTime(lockUntil);
          localStorage.setItem("unlockTime", lockUntil.toString());
          setError(`Too many failed attempts. Please try again later.`);
        }
        return newAttempts;
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Developer access handler
  const handleDeveloperAccess = () => {
    const correctDevKey = import.meta.env.VITE_DEV_KEY;
    if (devKey === correctDevKey) {
      localStorage.setItem("developerAccess", "true"); // ✅ set access flag
      navigate("/developer");
    } else {
      setError("Invalid developer key.");
    }
  };

  return (
    <>
      <div className="relative flex items-center justify-center py-0 px-0 md:py-8 md:px-4 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 font-inter overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob top-1/4 left-1/4"></div>
          <div className="absolute w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 bottom-1/4 right-1/4"></div>
        </div>

        <div className="relative z-10 w-full max-w-full md:max-w-lg p-8 bg-white md:rounded-xl shadow-2xl">
          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
              Welcome to OSCA IMS
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
                disabled={locked}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  disabled={locked}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={locked}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="text-right mt-3">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <span>{error}</span>
              </div>
            )}

            {locked && (
              <div className="flex items-center justify-center gap-2 text-red-600 text-sm font-medium">
                <Lock size={16} /> Account temporarily locked (
                {remainingSeconds}s)
              </div>
            )}

            <button
              type="submit"
              disabled={loading || locked}
              className={`w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-all ${
                loading || locked
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-indigo-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign in
                </>
              )}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-6">
            Not a member?{" "}
            <Link
              id="register"
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
              Register
            </Link>
          </p>
          <div className="text-center mt-4">
            <span
              onClick={() => setShowDevModal(true)}
              className="text-sm font-medium text-gary-600 hover:text-gray-500 cursor-pointer"
            >
              Developer Access
            </span>
          </div>
        </div>
      </div>
      {/* Developer Modal */}
      <Modal
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
        title="Enter Developer Key"
      >
        <input
          type="text"
          value={devKey}
          onChange={(e) => setDevKey(e.target.value)}
          placeholder="Developer Key"
          className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowDevModal(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleDeveloperAccess();
              setShowDevModal(false);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Access
          </button>
        </div>
      </Modal>
    </>
  );
}
