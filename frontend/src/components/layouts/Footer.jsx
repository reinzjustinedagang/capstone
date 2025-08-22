import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 shadow-inner w-full relative">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          {/* Logo placeholder */}
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center font-bold text-base">
            IMS
          </div>
          <span className="font-semibold text-base">
            Information Management System
          </span>
        </div>
        <nav className="flex gap-6 mb-2 md:mb-0">
          <a href="/" className="hover:text-green-400 transition text-sm">
            Home
          </a>
          <a href="/about" className="hover:text-green-400 transition text-sm">
            About
          </a>
          <a
            href="/contact"
            className="hover:text-green-400 transition text-sm"
          >
            Contact
          </a>
        </nav>
        <div className="text-sm text-gray-300 text-center md:text-right">
          <span>Contact: info@ims.com | +63 912 345 6789</span>
          <br />
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
