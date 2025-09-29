import React, { useEffect } from "react";
import Layout from "../../components/layouts/Layout";
import AuditLogs from "../../components/audit-logs/AuditLogs";
import Archive from "../../components/archive/Archive";

export const ArchivePage = () => {
  useEffect(() => {
    document.title = "Archive";
  }, []);
  return <Archive />;
};
