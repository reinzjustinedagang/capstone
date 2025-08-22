import React from "react";

import StaffSidebar from "./StaffSidebar";
import StaffHeader from "./StaffHeader";

const StaffLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <StaffSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <StaffHeader />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
};

export default StaffLayout;
