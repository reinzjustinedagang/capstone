import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import "./chartConfig";

const PensionerDistribution = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [counts, setCounts] = useState({
    DSWDSOCPEN: 0,
    GSIS: 0,
    SSS: 0,
    PVAO: 0,
    AFPSLAI: 0,
    OTHERS: 0,
  });

  const chartColors = {
    DSWDSOCPEN: "#4F46E5", // blue-violet
    GSIS: "#10B981", // green
    SSS: "#3B82F6", // blue
    PVAO: "#F59E0B", // amber
    AFPSLAI: "#8B5CF6", // purple
    OTHERS: "#9CA3AF", // gray
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/charts/pensioner`);
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
      <h3 className="text-lg font-medium mb-4">Pensioner Distribution</h3>

      <div className="h-72">
        <Pie
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

      {/* <ul className="mt-6 space-y-3">
        {Object.entries(counts).map(([key, value]) => (
          <li key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded"
                style={{ backgroundColor: chartColors[key] }}
              ></span>
              <span className="">{key}</span>
            </div>
            <span className="text-gray-800">{value}</span>
          </li>
        ))}
        <li className="flex items-center justify-between border-t pt-2 mt-2">
          <span className="font-semibold">Total</span>
          <span className="font-semibold text-gray-900">
            {Object.values(counts).reduce((a, b) => a + b, 0)}
          </span>
        </li>
      </ul> */}
    </div>
  );
};

export default PensionerDistribution;
