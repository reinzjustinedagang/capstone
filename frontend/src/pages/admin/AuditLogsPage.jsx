import React, { useEffect } from "react";
import Layout from "../../components/layouts/Layout";
import AuditLogs from "../../components/audit-logs/AuditLogs";

export const AuditLogsPage = () => {
  useEffect(() => {
    document.title = "Audit logs";
  }, []);
  return <AuditLogs />;
};
