import React from "react";
import StaffLayout from "../../components/staff/layout/StaffLayout";
import Dashboard from "../../components/staff/dashboard/Dashboard";
import SeniorCitizen from "../../components/staff/senior-citizen/SeniorCitizen";

export const StaffSeniorCitizenPage = () => {
  return (
    <StaffLayout>
      <SeniorCitizen />
    </StaffLayout>
  );
};
