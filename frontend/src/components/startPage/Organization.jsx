import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Header from "./Header";
import Footer from "./Footer";
import OrgChart from "./organization/OrgChart";
import MunicipalOfficials from "./organization/MunicipalOfficials";
import BarangayOfficials from "./organization/BarangayOfficials";

ChartJS.register(ArcElement, Tooltip, Legend);

// Example Officials Data

// Example Demographics Data
const demographics = [
  { name: "Barangay 1", value: 120 },
  { name: "Barangay 2", value: 95 },
  { name: "Barangay 3", value: 60 },
  { name: "Barangay 4", value: 80 },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50"];

const Organization = () => {
  const data = {
    labels: demographics.map((d) => d.name),
    datasets: [
      {
        data: demographics.map((d) => d.value),
        backgroundColor: COLORS,
        hoverOffset: 10,
      },
    ],
  };

  return (
    <div>
      <Header />

      {/* Section Header */}
      <div className="text-center px-5 py-6 md:px-25 bg-white">
        <h2 className="text-2xl font-bold text-gray-900">Organization</h2>
        <p className="text-gray-600 mt-2">
          Meet our officials and see the demographic distribution of senior
          citizens in San Jose.
        </p>
      </div>

      {/* Officials Cards */}
      <div className="px-5 py-6 md:px-8 lg:px-25 bg-white">
        <h3 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
          Barangay Association President
        </h3>
        <div className="overflow-x-auto w-full py-4 px-2">
          <BarangayOfficials />
        </div>
      </div>

      {/* Officials Cards */}
      <div className="px-5 py-6 md:px-8 lg:px-25 bg-white">
        <h3 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
          Federation Officer
        </h3>
        <div className="overflow-x-auto w-full py-4 px-2">
          <MunicipalOfficials />
        </div>
      </div>

      {/* Organizational Structure */}
      <div className="px-5 py-6 md:px-8 lg:px-25 bg-white">
        <h3 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
          Organizational Chart
        </h3>

        {/* Scrollable container for org chart */}
        <div className="overflow-x-auto w-full px-5 py-6 md:px-8 lg:px-25 bg-white">
          <OrgChart />
        </div>
      </div>

      {/* Demographics Chart */}
      <div className="bg-white px-5 py-6 md:px-8 lg:px-25">
        <h3 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
          Senior Citizens Demographics
        </h3>
        <div className="w-full max-w-md mx-auto">
          <Pie data={data} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Organization;
