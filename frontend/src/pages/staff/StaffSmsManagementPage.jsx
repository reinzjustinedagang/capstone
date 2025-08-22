import React from "react";
import StaffLayout from "../../components/staff/layout/StaffLayout";
import Dashboard from "../../components/staff/dashboard/Dashboard";
import Sms from "../../components/staff/sms/Sms";

export const StaffSmsManagementPage = () => {
  return (
    <div>
      <StaffLayout>
        <Sms />
      </StaffLayout>
    </div>
  );
};
