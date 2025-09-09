import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "./chartConfig";
import axios from "axios";

const BarangayDistribution = () => {
  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      { label: "Senior Citizens per Barangay", data: [], backgroundColor: [] },
    ],
  });
  const [gender, setGender] = useState(""); // "", "Male", "Female"

  // Generate dynamic colors
  const generateColors = (count) => {
    const colors = [
      "#6366F1",
      "#EF4444",
      "#10B981",
      "#F59E0B",
      "#3B82F6",
      "#EC4899",
      "#8B5CF6",
      "#F87171",
      "#34D399",
      "#FBBF24",
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/charts/barangay`, {
          params: { gender: gender || undefined },
        });

        const labels = res.data.map((item) => item.barangay);
        const data = res.data.map((item) => item.total);
        const backgroundColor = generateColors(labels.length);

        setChartData({
          labels,
          datasets: [
            {
              label: `Senior Citizens per Barangay${
                gender ? ` (${gender})` : ""
              }`,
              data,
              backgroundColor,
            },
          ],
        });
      } catch (err) {
        console.error("Failed to fetch barangay data:", err);
      }
    };

    fetchData();
  }, [gender]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Barangay-wise Distribution</h3>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="border rounded p-1 text-sm"
        >
          <option value="">All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: { legend: { position: "bottom" } },
        }}
      />
    </div>
  );
};

export default BarangayDistribution;
