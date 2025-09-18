import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Loader2 } from "lucide-react";
import "./chartConfig";

const TransfereeReportsChart = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [reports, setReports] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${backendUrl}/api/charts/transferees?year=${year}`
        );
        setReports(res.data || []);
      } catch (err) {
        console.error("Error fetching transferee reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [year, backendUrl]);

  const chartData = {
    labels: reports.map((r) => r.month), // ["Jan", "Feb", ...]
    datasets: [
      {
        label: "Male",
        data: reports.map((r) => r.male),
        backgroundColor: "#60A5FA", // blue
      },
      {
        label: "Female",
        data: reports.map((r) => r.female),
        backgroundColor: "#F472B6", // pink
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          Monthly Transferee Seniors Report
        </h3>

        {/* Year Selector */}
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

      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: { legend: { position: "bottom" } },
          scales: {
            x: { stacked: false },
            y: { beginAtZero: true, stacked: false },
          },
        }}
      />
    </div>
  );
};

export default TransfereeReportsChart;
