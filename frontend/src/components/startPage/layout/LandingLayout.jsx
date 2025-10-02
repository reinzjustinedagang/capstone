import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const LandingLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background animation - can be reused for all pages */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 bottom-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow relative z-10 pt-30">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingLayout;
