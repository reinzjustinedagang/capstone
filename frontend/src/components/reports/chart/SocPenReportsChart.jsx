import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "./chartConfig";

const SocPenReportsChart = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [reports, setReports] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/charts/socpen?year=${year}`
        );
        setReports(res.data || []);
      } catch (err) {
        console.error("Error fetching SocPen reports:", err);
      }
    };
    fetchReports();
  }, [year, backendUrl]);

  const chartData = {
    labels: reports.map((r) => r.month),
    datasets: [
      {
        label: "Male",
        data: reports.map((r) => r.male),
        backgroundColor: "#60A5FA",
      },
      {
        label: "Female",
        data: reports.map((r) => r.female),
        backgroundColor: "#F472B6",
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Monthly Social Pension Report</h3>
        <div className="flex items-center gap-2">
          <label className="font-semibold text-sm">Year:</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border px-2 py-1 rounded text-sm"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable wrapper like BarangayDistribution */}
      <div className="h-96 overflow-x-auto">
        <div className="min-w-[600px] h-full">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false, // fill the h-96 container
              plugins: { legend: { position: "bottom" } },
              scales: {
                x: {
                  stacked: false,
                  ticks: { maxRotation: 45, minRotation: 30 },
                },
                y: { beginAtZero: true, stacked: false },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SocPenReportsChart;
