import React, { useEffect } from "react";
import Dashboard from "../../components/dashboard/Dashboard";
import Layout from "../../components/layouts/Layout";

export const DashboardPage = () => {
  useEffect(() => {
    document.title = "Dashboard";
  }, []);
  return <Dashboard />;
};
