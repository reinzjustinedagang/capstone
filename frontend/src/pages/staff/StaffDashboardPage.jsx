import React from "react";
import StaffLayout from "../../components/staff/layout/StaffLayout";
import Dashboard from "../../components/staff/dashboard/Dashboard";

export const StaffDashboardPage = () => {
  return (
    <StaffLayout>
      <Dashboard />
    </StaffLayout>
  );
};
