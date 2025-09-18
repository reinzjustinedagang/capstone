import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Loader2 } from "lucide-react";
import "./chartConfig";

const DeceasedReportsChart = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [reports, setReports] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${backendUrl}/reports/deceased?year=${year}`
        );
        setReports(res.data || []);
      } catch (err) {
        console.error("Error fetching deceased reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [year]);

  const chartData = {
    labels: reports.map((r) => r.month), // e.g. ["Jan", "Feb", "Mar"]
    datasets: [
      {
        label: "Deceased Seniors",
        data: reports.map((r) => r.count), // make sure backend sends { month, count }
        backgroundColor: "#F87171",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: {
        display: true,
        text: `Monthly Deceased Seniors Report - ${year}`,
        font: { size: 18 },
      },
    },
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Monthly Deceased Seniors</h2>

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
        <Bar data={chartData} options={chartOptions} />
      )}
    </div>
  );
};

export default DeceasedReportsChart;
