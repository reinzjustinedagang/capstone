import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  HomeIcon,
  UserPlus,
  InfoIcon,
  LogIn,
  Building,
} from "lucide-react";
import logo from "../../assets/osca-logo.png";
import axios from "axios";

const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    system_name: "",
    municipality: "",
    province: "",
    seal: null,
  });
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/settings/`);
        setSystemSettings(res.data);
      } catch (err) {
        console.error("Failed to fetch system settings:", err);
      }
    };
    fetchSystemSettings();
  }, []);

  const navItems = [
    { to: "/", label: "Home", icon: HomeIcon },
    { to: "/organization", label: "Organization", icon: Building },

    { to: "/about", label: "About", icon: InfoIcon },
    { to: "/register-senior", label: "Register", icon: UserPlus },
    { to: "/login", label: "Login", icon: LogIn },
  ];

  return (
    <header className="sticky top-0 inset-x-0 z-50 bg-white shadow-2xl">
      <nav className="flex items-center justify-between p-5 lg:px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src={systemSettings.seal || logo}
            alt="OSCA Logo"
            className="h-20 w-auto object-contain"
          />
          <div className="hidden sm:block">
            <h1 className="font-bold text-blue-800 text-2xl">
              {systemSettings.system_name ||
                "Office of the Senior Citizen Affairs"}
            </h1>
            <p className="text-base font-medium">
              {systemSettings.municipality}, {systemSettings.province}
            </p>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex lg:gap-x-6">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors ${
                  isActive
                    ? "text-blue-700 bg-blue-100"
                    : "text-gray-700 hover:text-blue-600"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white bg-opacity-95 backdrop-blur-sm">
          <div className="p-6 space-y-6">
            {/* Header + Close */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={systemSettings.seal || logo}
                  alt="OSCA Logo"
                  className="h-12 w-auto"
                />
                <span className="font-bold text-blue-800 text-lg">
                  {systemSettings.system_name ||
                    "Office of the Senior Citizen Affairs"}
                </span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex flex-col gap-4">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-lg transition-colors ${
                      isActive
                        ? "text-blue-700 bg-blue-50"
                        : "text-gray-900 hover:bg-gray-100 hover:text-blue-600"
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
