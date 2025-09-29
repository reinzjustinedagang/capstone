import React, { useEffect } from "react";
import Layout from "../../components/layouts/Layout";
import BarangayManagement from "../../components/barangay/BarangayManagement";

export const BarangayManagementPage = () => {
  useEffect(() => {
    document.title = "Barangay";
  }, []);
  return <BarangayManagement />;
};
