import React, { useState, useEffect } from "react";
import { FileTextIcon, ImageIcon, PlusIcon } from "lucide-react";
import Button from "../UI/Button";
import Card from "../UI/Card";
import DemographicReports from "./DemographicReports";
import axios from "axios";
import OscaReports from "./OscaReports";

// This component displays various reports and summaries, including a count of all events.
const Reports = () => {
  // State to manage the active tab for the reports section
  const [activeTab, setActiveTab] = useState("reports");
  // State to store the total count of events
  const [eventsCount, setEventsCount] = useState(0);

  // Backend URL from environment variables
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  // Function to fetch the total events count from the backend
  const fetchEventsCount = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/events/count/all`);
      setEventsCount(res.data.count);
    } catch (err) {
      console.error("Failed to fetch events count", err);
    }
  };

  // useEffect hook to fetch the initial count when the component mounts
  // This will only run once.
  useEffect(() => {
    fetchEventsCount();
  }, []);

  return (
    <>
      {/* Summary Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Card to display the total number of events */}
        <Card title="Reports" value="2" icon={<ImageIcon />} color="purple" />
        {/* Card for registered senior citizens (hardcoded value) */}
        <Card
          title="Registered Senior Citizens"
          value="3,215"
          icon={<FileTextIcon />}
          color="green"
        />
      </div>

      {/* Tabbed navigation for different reports */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-300">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("reports")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "reports"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab("demographics")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "demographics"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Demographics
            </button>
          </nav>
        </div>
        <div className="p-4">
          {/* Conditionally render the correct component based on the active tab */}
          {activeTab === "reports" && <OscaReports />}
          {activeTab === "demographics" && <DemographicReports />}
        </div>
      </div>
    </>
  );
};

export default Reports;
