import React, { useState } from "react";
import NewSeniorReportsChart from "../../reports/chart/NewSeniorReportsChart";
import DeceasedReportsChart from "../../reports/chart/DeceasedReportsChart";
import TransfereeReportsChart from "../../reports/chart/TransfereeReportsChart";
import SocPenReportsChart from "../../reports/chart/SocPenReportsChart";
import NonSocPenReportsChart from "../../reports/chart/NonSocPenReportsChart";
import PDLReportsChart from "../../reports/chart/PDLReportsChart";
import BookletReportsChart from "../../reports/chart/BookletReportsChart";
import UtpReportsChart from "../../reports/chart/UtpReportsChart";
import PensionerDistribution from "../../reports/chart/PensionerDistribution";
import RemarksDistribution from "../../reports/chart/RemarksDistribution";

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
      {/* <div>
        <h2 className="text-lg font-medium mb-4">Printable Reports</h2>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-3/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Name
                  </th>
                  <th className="w-1/4 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Barangay Demographic Report
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex justify-end">
                      <BarangayReportPrint />
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Pensioner and Remarks Report
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex justify-end">
                      <PensionerRemarksReportPrint />
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Monthly Summary Report
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex justify-end">
                      <MonthlySummaryReportPrint />
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Senior Citizen List Report
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex justify-end">
                      <CitizenListPrint />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div> */}

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
          <RemarksDistribution />
        </div>
      </div>
    </div>
  );
};

export default OscaReportsChart;
