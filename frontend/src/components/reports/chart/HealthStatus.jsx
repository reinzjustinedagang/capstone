import React from "react";
import { Doughnut } from "react-chartjs-2";
import "./chartConfig";

const HealthStatus = () => {
  const data = {
    labels: ["Good", "With Maintenance", "Needs Attention", "Critical"],
    datasets: [
      {
        data: [450, 520, 180, 95],
        backgroundColor: [
          "rgba(34, 197, 94, 0.6)",
          "rgba(59, 130, 246, 0.6)",
          "rgba(234, 179, 8, 0.6)",
          "rgba(239, 68, 68, 0.6)",
        ],
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Health Status</h3>
      <div className="h-[300px] flex items-center justify-center">
        <Doughnut
          data={data}
          options={{
            responsive: true,
            plugins: { legend: { position: "bottom" } },
          }}
        />
      </div>
    </div>
  );
};

export default HealthStatus;
