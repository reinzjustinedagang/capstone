import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, HomeIcon, InfoIcon, LogIn, Building } from "lucide-react";
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

  const [logoLoaded, setLogoLoaded] = useState(false);
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/settings/`);
        const settings = res.data || {};
        setSystemSettings(settings);

        // Set favicon dynamically
        if (settings.seal) {
          let link = document.querySelector("link[rel='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = settings.seal;
        }
      } catch (err) {
        console.error("Failed to fetch system settings:", err);
      }
    };

    fetchSystemSettings();
  }, []);

  useEffect(() => {
    if (systemSettings.system_name) {
      document.title = systemSettings.system_name;
    }
  }, [systemSettings.system_name]);

  const navItems = [
    { to: "/", label: "Home", icon: HomeIcon },
    { to: "/organization", label: "Organization", icon: Building },
    { to: "/about", label: "About Us", icon: InfoIcon },
    { to: "/login", label: "Login", icon: LogIn },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white shadow-2xl">
      <nav className="flex items-center justify-between p-5 lg:px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-20 w-20 rounded-full border-2 border-blue-700 flex items-center justify-center overflow-hidden">
            {!logoLoaded && (
              <div className="h-full w-full animate-pulse bg-gray-100 rounded-full"></div>
            )}
            {systemSettings.seal && (
              <img
                src={systemSettings.seal}
                alt="OSCA Logo"
                className={`h-full w-full object-contain rounded-full transition-opacity duration-500 ${
                  logoLoaded ? "opacity-100" : "opacity-0 absolute"
                }`}
                onLoad={() => setLogoLoaded(true)}
                onError={() => setLogoLoaded(true)}
              />
            )}
          </div>

          <div className="hidden sm:block">
            <h1 className="font-bold text-blue-800 text-2xl">
              {systemSettings.system_name || "————————"}
            </h1>
            <p className="text-base font-medium">
              {[systemSettings.municipality, systemSettings.province]
                .filter(Boolean)
                .join(", ") || "—————————"}
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
        <div className="lg:hidden fixed inset-0 z-50 bg-opacity-95 backdrop-blur-sm flex">
          {/* Dimmed background */}
          <div
            className="flex-1 bg-opacity-40"
            onClick={() => setMenuOpen(false)}
          ></div>

          {/* Slide-in menu */}
          <div className="w-72 max-w-xs bg-white shadow-xl h-full overflow-y-auto animate-slide-in">
            <div className="p-6 space-y-6">
              {/* Header + Close */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={systemSettings.seal || null}
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
        </div>
      )}
    </header>
  );
};

export default Header;
