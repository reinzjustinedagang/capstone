import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import OrgChart from "./organization/OrgChart";
import MunicipalOfficials from "./organization/MunicipalOfficials";
import BarangayOfficials from "./organization/BarangayOfficials";
import BarangayDistribution from "../reports/chart/BarangayDistribution";

const Organization = () => {
  return (
    <div>
      {/* Section Header */}
      <div className="text-center px-5 py-6 md:px-25 ">
        <h2 className="text-3xl font-bold text-gray-900">Organization</h2>
        {/* <p className="text-gray-600 mt-2">
          Meet our officials and see the demographic distribution of senior
          citizens in San Jose.
        </p> */}
      </div>

      {/* Officials Cards */}
      <div className="px-5 py-6 md:px-8 lg:px-25 ">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Barangay Association President
        </h3>
        <div className="overflow-x-auto w-full py-4 px-2">
          <BarangayOfficials />
        </div>
      </div>

      {/* Officials Cards */}
      <div className="px-5 py-6 md:px-8 lg:px-25 ">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Federation Officer
        </h3>
        <div className="overflow-x-auto w-full py-4 px-2">
          <MunicipalOfficials />
        </div>
      </div>

      {/* Organizational Structure */}
      <div className="px-5 py-6 md:px-8 lg:px-25 ">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Organizational Chart
        </h3>

        {/* Scrollable container for org chart */}
        <div className="overflow-x-auto w-full px-5 py-6 md:px-8 lg:px-25 ">
          <OrgChart />
        </div>
      </div>

      {/* Demographics Chart */}
      <div id="demographics" className=" px-5 py-6 md:px-8 lg:px-25">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Senior Citizens Demographics
        </h3>
        <BarangayDistribution />
      </div>
    </div>
  );
};

export default Organization;
