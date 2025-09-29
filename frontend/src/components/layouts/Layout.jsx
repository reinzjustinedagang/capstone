import React from "react";
import Sidebar from "./Sidebar"; // Ensure paths are correct
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto md:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
