import React from "react";
import StaffLayout from "../../components/staff/layout/StaffLayout";
import Dashboard from "../../components/staff/dashboard/Dashboard";
import MyProfile from "../../components/staff/my-profile/MyProfile";

export const StaffProfilePage = () => {
  return (
    <StaffLayout>
      <MyProfile />
    </StaffLayout>
  );
};
