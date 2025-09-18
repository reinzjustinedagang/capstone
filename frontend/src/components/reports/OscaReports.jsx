import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Loader2 } from "lucide-react";
import "./chart/chartConfig"; // make sure Chart.js is configured
import DeceasedReportsChart from "./chart/DeceasedReportsChart";

const OscaReportsChart = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [reports, setReports] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${backendUrl}/reports/monthly?year=${year}`
        );
        setReports(res.data || []);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [year]);

  // Prepare chart data
  const chartData = {
    labels: reports.map((r) => r.month),
    datasets: [
      {
        label: "SocPen",
        data: reports.map((r) => r.socpen),
        backgroundColor: "#3B82F6",
      },
      {
        label: "Non-SocPen",
        data: reports.map((r) => r.nonsocpen),
        backgroundColor: "#EC4899",
      },
      {
        label: "Deceased",
        data: reports.map((r) => r.deceased),
        backgroundColor: "#F59E0B",
      },
      {
        label: "Transferee",
        data: reports.map((r) => r.transferee),
        backgroundColor: "#10B981",
      },
      {
        label: "PDL (M)",
        data: reports.map((r) => r.pdl_male),
        backgroundColor: "#6366F1",
      },
      {
        label: "PDL (F)",
        data: reports.map((r) => r.pdl_female),
        backgroundColor: "#EC4899",
      },
      {
        label: "New (M)",
        data: reports.map((r) => r.new_male),
        backgroundColor: "#3B82F6",
      },
      {
        label: "New (F)",
        data: reports.map((r) => r.new_female),
        backgroundColor: "#EC4899",
      },
      {
        label: "UTP (M)",
        data: reports.map((r) => r.utp_male),
        backgroundColor: "#F97316",
      },
      {
        label: "UTP (F)",
        data: reports.map((r) => r.utp_female),
        backgroundColor: "#F472B6",
      },
      {
        label: "Booklet (M)",
        data: reports.map((r) => r.booklet_male),
        backgroundColor: "#3B82F6",
      },
      {
        label: "Booklet (F)",
        data: reports.map((r) => r.booklet_female),
        backgroundColor: "#EC4899",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: {
        display: true,
        text: `Monthly Senior Citizen Report - ${year}`,
        font: { size: 18 },
      },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Monthly Senior Citizen Report</h2>

      {/* Year Selector */}
      <div className="flex items-center gap-2 mb-4">
        <label className="font-semibold">Year:</label>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border px-2 py-1 rounded"
        >
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin" size={20} /> Loading...
        </div>
      ) : (
        <>
          <Bar data={chartData} options={chartOptions} />
          <DeceasedReportsChart />
        </>
      )}
    </div>
  );
};

export default OscaReportsChart;
