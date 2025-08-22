import React from "react";
import StaffLayout from "../../components/staff/layout/StaffLayout";
import Dashboard from "../../components/staff/dashboard/Dashboard";
import LoginTrail from "../../components/staff/login-trail/LoginTrail";

export const StaffLoginTrailPage = () => {
  return (
    <StaffLayout>
      <LoginTrail />
    </StaffLayout>
  );
};
