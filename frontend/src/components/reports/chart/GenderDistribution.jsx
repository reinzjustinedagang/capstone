import React from "react";
import { Pie } from "react-chartjs-2";
import "./chartConfig";

const GenderDistribution = () => {
  const data = {
    labels: ["Male", "Female"],
    datasets: [
      {
        data: [580, 665],
        backgroundColor: ["rgba(14, 165, 233, 0.6)", "rgba(236, 72, 153, 0.6)"],
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Gender Distribution</h3>
      <div className="h-[300px] flex items-center justify-center">
        <Pie
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

export default GenderDistribution;
