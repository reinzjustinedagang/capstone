import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import "./chartConfig";

const GenderDistribution = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [chartData, setChartData] = useState({
    labels: ["Male", "Female"],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ["#3B82F6", "#EC4899"], // blue, pink
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/charts/gender`);
        setChartData({
          labels: ["Male", "Female"],
          datasets: [
            {
              data: [res.data.male_count, res.data.female_count],
              backgroundColor: ["#3B82F6", "#EC4899"],
            },
          ],
        });
      } catch (err) {
        console.error("Failed to fetch gender distribution:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Gender Distribution</h3>
      <Pie
        data={chartData}
        options={{
          responsive: true,
          plugins: { legend: { position: "bottom" } },
        }}
      />
    </div>
  );
};

export default GenderDistribution;
