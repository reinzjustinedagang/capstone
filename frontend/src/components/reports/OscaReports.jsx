import React, { useState } from "react";
import NewSeniorReportsChart from "./chart/NewSeniorReportsChart";
import DeceasedReportsChart from "./chart/DeceasedReportsChart";
import TransfereeReportsChart from "./chart/TransfereeReportsChart";
import SocPenReportsChart from "./chart/SocPenReportsChart";
import NonSocPenReportsChart from "./chart/NonSocPenReportsChart";
import PDLReportsChart from "./chart/PDLReportsChart";
import BookletReportsChart from "./chart/BookletReportsChart";
import BarangayReportPrint from "./print/BarangayReportPrint";
import UtpReportsChart from "./chart/UtpReportsChart";
import MonthlySummaryReportPrint from "./print/MonthlySummaryReportPrint";
import PensionerDistribution from "./chart/PensionerDistribution";
import RemarksDistribution from "./chart/RemarksDistribution";
import PensionerRemarksReportPrint from "./print/PensionerRemarksReportPrint";
import CitizenListPrint from "./print/CitizenListPrint";
import ReportsSummary from "./chart/ReportsSummary";

const OscaReportsChart = () => {
  const chartOptions = [
    { label: "New Senior Citizen", component: <NewSeniorReportsChart /> },
    { label: "SocPen", component: <SocPenReportsChart /> },
    { label: "Non-SocPen", component: <NonSocPenReportsChart /> },
    { label: "PDL", component: <PDLReportsChart /> },
    { label: "Booklet", component: <BookletReportsChart /> },
    { label: "Transferee", component: <TransfereeReportsChart /> },
    { label: "Deceased", component: <DeceasedReportsChart /> },
    { label: "UTP", component: <UtpReportsChart /> },
  ];
  const [filters, setFilters] = useState({
    gender: "All",
    barangay: "All Barangays",
    remarks: "All Remarks",
  });

  const [selectedChart, setSelectedChart] = useState(chartOptions[0].label);

  const renderSelectedChart = () => {
    const chart = chartOptions.find((c) => c.label === selectedChart);
    return chart?.component || null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-4">Printable Reports</h2>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Horizontal scroll on small screens */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-50 hidden sm:table-header-group">
                <tr>
                  <th className="w-3/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Name
                  </th>
                  <th className="w-1/4 px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {/* Row */}
                <tr className="hover:bg-gray-50 flex flex-col sm:table-row">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="sm:hidden block text-xs font-semibold text-gray-500 mb-1">
                      Report Name
                    </span>
                    Barangay Demographic Report
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className="sm:hidden block text-xs font-semibold text-gray-500 mb-1">
                      Actions
                    </span>
                    <div className="flex justify-end ">
                      <BarangayReportPrint />
                    </div>
                  </td>
                </tr>

                {/* Row */}
                <tr className="hover:bg-gray-50 flex flex-col sm:table-row">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="sm:hidden block text-xs font-semibold text-gray-500 mb-1">
                      Report Name
                    </span>
                    Pensioner and Remarks Report
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className="sm:hidden block text-xs font-semibold text-gray-500 mb-1">
                      Actions
                    </span>
                    <div className="flex justify-end ">
                      <PensionerRemarksReportPrint />
                    </div>
                  </td>
                </tr>

                {/* Row */}
                <tr className="hover:bg-gray-50 flex flex-col sm:table-row">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="sm:hidden block text-xs font-semibold text-gray-500 mb-1">
                      Report Name
                    </span>
                    Annual Summary Report
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className="sm:hidden block text-xs font-semibold text-gray-500 mb-1">
                      Actions
                    </span>
                    <div className="flex justify-end ">
                      <MonthlySummaryReportPrint />
                    </div>
                  </td>
                </tr>

                {/* Row */}
                <tr className="hover:bg-gray-50 flex flex-col sm:table-row">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="sm:hidden block text-xs font-semibold text-gray-500 mb-1">
                      Report Name
                    </span>
                    Senior Citizen List Report
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className="sm:hidden block text-xs font-semibold text-gray-500 mb-1">
                      Actions
                    </span>
                    <div className="flex justify-end ">
                      <CitizenListPrint />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Other Reports Section */}
      <div className=" rounded-lg">
        <h2 className="text-lg font-medium mb-4">Statistical Reports</h2>
        {/* Dropdown to select charts */}
        <div className="flex items-center gap-3 mb-4">
          <label className="font-medium text-gray-600">Select Report:</label>
          <select
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {chartOptions.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {/* Render the selected chart */}
        <div>{renderSelectedChart()}</div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <PensionerDistribution />
          <RemarksDistribution /> <ReportsSummary />
        </div>
      </div>
    </div>
  );
};

export default OscaReportsChart;
