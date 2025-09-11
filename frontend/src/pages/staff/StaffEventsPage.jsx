import React from "react";
import StaffLayout from "../../components/staff/layout/StaffLayout";
import Dashboard from "../../components/staff/dashboard/Dashboard";
import Benefits from "../../components/staff/benefits/Benefits";
import EventList from "../../components/staff/events/EventList";

export const StaffEventsPage = () => {
  return (
    <StaffLayout>
      <EventList />
    </StaffLayout>
  );
};
