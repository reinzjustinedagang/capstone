import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import "./chartConfig"; // register chart.js modules

const AgeDistribution = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [chartData, setChartData] = useState({
    labels: ["60-65", "66-70", "71-75", "76-80", "81-85", "86+"],
    datasets: [
      {
        label: "Number of Senior Citizens",
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/charts/age`);
        setChartData({
          labels: ["60-65", "66-70", "71-75", "76-80", "81-85", "86+"],
          datasets: [
            {
              label: "Number of Senior Citizens",
              data: [
                res.data["60_65"],
                res.data["66_70"],
                res.data["71_75"],
                res.data["76_80"],
                res.data["81_85"],
                res.data["86_plus"],
              ],
              backgroundColor: "rgba(59, 130, 246, 0.5)",
            },
          ],
        });
      } catch (err) {
        console.error("Failed to fetch age distribution:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Age Distribution</h3>
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

export default AgeDistribution;
