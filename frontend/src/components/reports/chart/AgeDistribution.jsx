import React from "react";
import { Bar } from "react-chartjs-2";
import "./chartConfig"; // register chart.js modules

const AgeDistribution = () => {
  const data = {
    labels: ["60-65", "66-70", "71-75", "76-80", "81-85", "86+"],
    datasets: [
      {
        label: "Number of Senior Citizens",
        data: [350, 425, 280, 190, 145, 80],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Age Distribution</h3>
      <Bar
        data={data}
        options={{
          responsive: true,
          plugins: { legend: { position: "bottom" } },
        }}
      />
    </div>
  );
};

export default AgeDistribution;
