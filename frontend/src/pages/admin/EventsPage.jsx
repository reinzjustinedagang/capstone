import React, { useEffect } from "react";
import Layout from "../../components/layouts/Layout";
import Events from "../../components/event/Events";

export const EventsPage = () => {
  useEffect(() => {
    document.title = "Events";
  }, []);
  return <Events />;
};
