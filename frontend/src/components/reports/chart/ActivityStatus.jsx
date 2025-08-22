import React from "react";
import { Doughnut } from "react-chartjs-2";
import "./chartConfig";

const ActivityStatus = () => {
  const data = {
    labels: ["Active", "Inactive", "Deceased"],
    datasets: [
      {
        data: [980, 185, 80],
        backgroundColor: [
          "rgba(34, 197, 94, 0.6)",
          "rgba(234, 179, 8, 0.6)",
          "rgba(239, 68, 68, 0.6)",
        ],
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Activity Status</h3>
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

export default ActivityStatus;
