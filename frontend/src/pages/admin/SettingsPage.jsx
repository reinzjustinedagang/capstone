import React, { useEffect } from "react";
import Settings from "../../components/settings/Settings";
import Layout from "../../components/layouts/Layout";

export const SettingsPage = () => {
  useEffect(() => {
    document.title = "Settings";
  }, []);
  return <Settings />;
};
