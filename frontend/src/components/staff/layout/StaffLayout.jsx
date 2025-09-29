import React from "react";
import { Outlet } from "react-router-dom";

import StaffSidebar from "./StaffSidebar";
import StaffHeader from "./StaffHeader";

const StaffLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <StaffSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <StaffHeader />
        <main className="flex-1 overflow-y-auto md:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
