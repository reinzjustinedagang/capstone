import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "../UI/Modal";
import logo from "../../assets/osca-logo.png";
import {
  HomeIcon,
  UsersIcon,
  MessageSquareIcon,
  UserCogIcon,
  SettingsIcon,
  LogOutIcon,
  FileTextIcon,
  GiftIcon,
  UserIcon,
  Wallet,
  MenuIcon,
  XIcon,
  UserCheck,
  ClipboardListIcon,
  Calendar,
  InfoIcon,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const menuItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: HomeIcon },
    {
      to: "/admin/senior-citizen-list",
      label: "Senior Citizens",
      icon: UsersIcon,
    },

    // { to: "/admin/pension-list", label: "Pension List", icon: Wallet },
    {
      to: "/admin/sms-management",
      label: "SMS Management",
      icon: MessageSquareIcon,
    },

    { to: "/admin/reports", label: "Reports", icon: FileTextIcon },
    { to: "/admin/benefits", label: "Benefits", icon: GiftIcon },
    { to: "/admin/events", label: "Events", icon: Calendar },
    { to: "/admin/osca-officials", label: "OSCA Officials", icon: UserCheck },
    { to: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardListIcon },
    {
      to: "/admin/user-management",
      label: "User Management",
      icon: UserCogIcon,
    },
    { to: "/admin/about", label: "About OSCA", icon: InfoIcon },
  ];

  return (
    <>
      {/* Burger menu button for small screens */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-blue-800 bg-white rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open sidebar"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Overlay for when sidebar is open on small screens */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar content */}
      <aside
        className={`
    fixed inset-y-0 left-0 z-50 w-64 bg-white text-gray-800
    border-r border-gray-200 shadow-lg transform transition-transform duration-500 ease-in-out
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    md:relative md:translate-x-0
    overflow-y-auto h-screen
  `}
      >
        {/* Close button inside sidebar on mobile */}
        <div className="md:hidden absolute top-4 right-4 z-50">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-blue-800 bg-white rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close sidebar"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center">
          <img
            src={systemSettings.seal || logo}
            alt="OSCA Logo"
            className="h-20 w-auto object-contain border-2 rounded-full border-blue-800"
          />
          <h1 className="text-xl font-bold text-blue-800">
            {systemSettings.system_name ||
              "Office of the Senior Citizen Affairs"}
          </h1>
          <p className="text-sm font-medium text-gray-800">
            {systemSettings.municipality || "San Jose"}
            {", "}
            {systemSettings.province || "Occidental Mindoro"}
          </p>
        </div>

        <nav className="mt-6">
          {menuItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav ${isActive ? "active-nav" : ""}`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <Icon className="h-5 w-5 mr-3" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
