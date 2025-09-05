import React, { useEffect, useState } from "react";
import { BellIcon, MenuIcon, UserIcon, LogOut, Settings } from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Modal from "../UI/Modal";
import defaultUser from "../../assets/user.png";
import axios from "axios";

const Header = () => {
  const [user, setUser] = useState({
    username: "Guest",
    role: "User",
    image: null,
  });
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false); // ✅ new

  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/api/user/me`, {
          withCredentials: true,
        });
        if (res.status === 200 && res.data.isAuthenticated) {
          setUser({
            username: res.data.username || "Guest",
            role: res.data.role || "User",
            image: res.data.image || null,
          });
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser({ username: "Guest", role: "User", image: null });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true); // ✅ start loading
    try {
      await axios.post(
        `${backendUrl}/api/user/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.clear();
      navigate("/login");
      setLogoutLoading(false); // ✅ stop loading
    }
  };

  const pageTitle = location.pathname
    .split("/")
    .pop()
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex justify-between items-center p-4">
        <button className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100">
          <MenuIcon className="h-6 w-6" />
        </button>

        <h1 className="text-xl font-bold text-blue-700">{pageTitle}</h1>

        <div className="flex items-center space-x-4 ml-auto">
          <NavLink
            to="/admin/notifications"
            className={({ isActive }) =>
              `relative p-2 rounded-full transition duration-150 ${
                isActive
                  ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1 right-1 bg-red-500 border-2 border-white rounded-full w-2.5 h-2.5"></span>
          </NavLink>

          <div className="flex items-center">
            <div className="mr-3 text-right hidden sm:block">
              {loading ? (
                <div className="text-sm text-gray-400">Loading...</div>
              ) : (
                <>
                  <p className="text-sm font-medium text-blue-800">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </p>
                </>
              )}
            </div>

            <div className="relative group">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="h-10 w-10 rounded-full overflow-hidden border-2 border-blue-500 shadow focus:outline-none"
              >
                <img
                  src={user.image || defaultUser}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-md w-44 z-50">
                  <button
                    onClick={() => {
                      navigate("/admin/my-profile");
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-blue-600 hover:text-white"
                  >
                    <UserIcon className="h-4 w-4" />
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      navigate("/admin/settings");
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-blue-600 hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-700 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Confirm Logout"
      >
        <div className="py-4 text-center">
          <p className="text-gray-700 mb-6">
            Are you sure you want to log out?
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className={`px-5 py-2 rounded-md text-white ${
                logoutLoading
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {logoutLoading ? "Logging out..." : "Yes, Logout"}
            </button>
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </header>
  );
};

export default Header;
