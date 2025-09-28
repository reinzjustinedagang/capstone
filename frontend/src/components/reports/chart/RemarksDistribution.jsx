import React, { useEffect, useState } from "react";
import { Doughnut, Pie } from "react-chartjs-2";
import axios from "axios";
import "./chartConfig";

const RemarksDistribution = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [counts, setCounts] = useState({
    SOCIALPENSION: 0,
    NONSOCIALPENSION: 0,
    INDIGENT: 0,
  });

  const chartColors = {
    SOCIALPENSION: "#6366F1", // indigo
    NONSOCIALPENSION: "#10B981", // green
    INDIGENT: "#F59E0B", // amber
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/charts/remarks`);
        setCounts(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch pensioner distribution:", err);
      }
    };

    fetchData();
  }, [backendUrl]);

  const chartData = {
    labels: Object.keys(counts),
    datasets: [
      {
        data: Object.values(counts),
        backgroundColor: Object.keys(counts).map((key) => chartColors[key]),
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
            },
          }}
        />
      </div>
    </div>
  );
};

export default RemarksDistribution;
