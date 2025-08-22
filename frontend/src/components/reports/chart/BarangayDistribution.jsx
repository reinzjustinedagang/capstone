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
      {
        label: "Senior Citizens per Barangay",
        data: [],
        backgroundColor: [],
      },
    ],
  });

  // Generate different colors dynamically
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
    // Repeat colors if count > colors.length
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/charts/barangay`);
        const labels = res.data.map((item) => item.barangay);
        const data = res.data.map((item) => item.total);
        const backgroundColor = generateColors(labels.length);

        setChartData({
          labels,
          datasets: [
            {
              label: "Senior Citizens per Barangay",
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
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Barangay-wise Distribution</h3>
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
