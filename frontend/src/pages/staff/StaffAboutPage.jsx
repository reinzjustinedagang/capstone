import React from "react";
import StaffLayout from "../../components/staff/layout/StaffLayout";
import Dashboard from "../../components/staff/dashboard/Dashboard";
import AboutOsca from "../../components/staff/about/AboutOsca";

export const StaffAboutPage = () => {
  return (
    <StaffLayout>
      <AboutOsca />
    </StaffLayout>
  );
};
