import React, { useEffect } from "react";
import Layout from "../../components/layouts/Layout";
import Notification from "../../components/notification/Notification";
import BirthdayCalendar from "../../components/notification/BirthdayCalendar";

export const NotificationPage = () => {
  useEffect(() => {
    document.title = "Birthday Calendar";
  }, []);
  return <BirthdayCalendar />;
};
