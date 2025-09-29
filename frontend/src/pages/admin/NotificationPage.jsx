import React, { useEffect } from "react";
import Layout from "../../components/layouts/Layout";
import Notification from "../../components/notification/Notification";

export const NotificationPage = () => {
  useEffect(() => {
    document.title = "Notification";
  }, []);
  return <Notification />;
};
