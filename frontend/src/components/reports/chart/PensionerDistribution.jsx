import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import axios from "axios";
import "./chartConfig";

const PensionerDistribution = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [report, setReport] = useState({});
  const [distribution, setDistribution] = useState({});

  const chartColors = {
    DSWDSOCPEN: "#4F46E5",
    GSIS: "#10B981",
    SSS: "#3B82F6",
    PVAO: "#F59E0B",
    AFPSLAI: "#8B5CF6",
    OTHERS: "#9CA3AF",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/charts/pensioner`);
        setReport(res.data.report);
        setDistribution(res.data.distribution);
      } catch (err) {
        console.error("❌ Failed to fetch pensioner distribution:", err);
      }
    };

    fetchData();
  }, [backendUrl]);

  const pieData = {
    labels: Object.keys(report),
    datasets: [
      {
        data: Object.values(report),
        backgroundColor: Object.keys(report).map((key) => chartColors[key]),
      },
    ],
  };

  const barData = {
    labels: Object.keys(distribution),
    datasets: [
      {
        label: "Number of Seniors",
        data: Object.values(distribution),
        backgroundColor: "#3B82F6",
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-8">
      {/* PIE CHART */}
      <div>
        <h3 className="text-lg font-medium mb-4">
          Pensioner Distribution by Type
        </h3>
        <div className="h-72">
          <Pie
            data={pieData}
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

      {/* BAR CHART */}
      <div>
        <h3 className="text-lg font-medium mb-4">
          Number of Pensions per Senior
        </h3>
        <div className="h-64">
          <Bar
            data={barData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 1 },
                },
              },
              plugins: {
                legend: { display: false },
                datalabels: {
                  color: "#111827",
                  anchor: "end",
                  align: "top",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PensionerDistribution;
