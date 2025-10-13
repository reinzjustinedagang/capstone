import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
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
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
        tension: 0.3, // smooth line curve
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/charts/age`);
        setChartData({
          labels: [
            "60-65",
            "66-70",
            "71-75",
            "76-80",
            "81-85",
            "86-90",
            "91-95",
            "96-100",
            "100+",
          ],
          datasets: [
            {
              label: "Number of Senior Citizens",
              data: [
                res.data["60_65"],
                res.data["66_70"],
                res.data["71_75"],
                res.data["76_80"],
                res.data["81_85"],
                res.data["86_90"],
                res.data["91_95"],
                res.data["96_100"],
                res.data["100_plus"],
              ],
              borderColor: "rgba(59, 130, 246, 1)",
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              fill: true,
              tension: 0.3,
            },
          ],
        });
      } catch (err) {
        console.error("Failed to fetch age distribution:", err);
      }
    };

    fetchData();
  }, [backendUrl]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Age Distribution</h3>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
            datalabels: {
              display: (context) =>
                context.dataset.data[context.dataIndex] !== 0,
              anchor: "end",
              align: "right",
              formatter: (value) => value,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0, // avoids decimals
              },
            },
          },
        }}
      />
    </div>
  );
};

export default AgeDistribution;
