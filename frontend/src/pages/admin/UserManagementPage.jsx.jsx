import React, { useEffect } from "react";
import Layout from "../../components/layouts/Layout";
import UserManagement from "../../components/userManagement/UserManagement";

export const UserManagementPage = () => {
  useEffect(() => {
    document.title = "User Management";
  }, []);
  return <UserManagement />;
};
