import React, { useEffect } from "react";
import Layout from "../../components/layouts/Layout";
import Reports from "../../components/reports/Reports";

export const ReportPage = () => {
  useEffect(() => {
    document.title = "Reports";
  }, []);
  return <Reports />;
};
