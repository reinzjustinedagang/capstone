import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import axios from "axios";
import "./chartConfig";

const RemarksDistribution = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [counts, setCounts] = useState({});

  // Fallback color palette for extra remarks
  const defaultColors = [
    "#EF4444", // red
    "#3B82F6", // blue
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#14B8A6",
    "#F59E0B",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/charts/remarks`);
        setCounts(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch remarks distribution:", err);
      }
    };

    fetchData();
  }, [backendUrl]);

  const labels = Object.keys(counts);
  const values = Object.values(counts);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map(
          (key, idx) => defaultColors[idx % defaultColors.length]
        ),
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Remarks Distribution</h3>
      {/* Chart */}
      <div className="h-72">
        <Doughnut
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "bottom" },
              datalabels: {
                display: (context) =>
                  context.dataset.data[context.dataIndex] !== 0,
                color: "#374151",
                formatter: (value) => value,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default RemarksDistribution;
