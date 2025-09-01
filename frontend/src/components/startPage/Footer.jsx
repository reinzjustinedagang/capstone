import React, { useEffect, useState } from "react";
import axios from "axios";

const Footer = () => {
  const [systemName, setSystemName] = useState(
    "Office of the Senior Citizen Affairs"
  );
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/settings/`);
        if (res.data.system_name) setSystemName(res.data.system_name);
      } catch (err) {
        console.error("Failed to fetch system settings:", err);
      }
    };
    fetchSystemSettings();
  }, []);

  return (
    <footer className="bg-white text-gray-700 p-6">
      <div className="container mx-auto flex flex-col items-center gap-4">
        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
          <a href="#" className="hover:text-blue-700 transition-colors">
            Home
          </a>
          <a href="#" className="hover:text-blue-700 transition-colors">
            Organization
          </a>
          <a href="#" className="hover:text-blue-700 transition-colors">
            About
          </a>
          <a href="#" className="hover:text-blue-700 transition-colors">
            Register
          </a>
        </div>

        {/* Copyright */}
        <p className="text-sm text-gray-500 mt-2 text-center">
          &copy; {new Date().getFullYear()} {systemName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
