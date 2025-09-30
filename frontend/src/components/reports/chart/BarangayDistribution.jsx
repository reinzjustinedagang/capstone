import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "./chartConfig";
import axios from "axios";

const BarangayDistribution = () => {
  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/charts/barangay`);

        const labels = res.data.map((item) => item.barangay);
        const maleData = res.data.map((item) => item.male_count);
        const femaleData = res.data.map((item) => item.female_count);

        setChartData({
          labels,
          datasets: [
            {
              label: "Male",
              data: maleData,
              backgroundColor: "#3B82F6", // blue
            },
            {
              label: "Female",
              data: femaleData,
              backgroundColor: "#EC4899", // pink
            },
          ],
        });
      } catch (err) {
        console.error("Failed to fetch barangay data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div id="demographics" className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Barangay Demographic Reports</h3>

      {/* Scrollable wrapper */}
      <div className="h-96 overflow-x-auto appearance-none scrollbar-hide">
        <div className="min-w-[600px] h-full">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: {
                  top: 30, // 👈 extra space above chart
                },
              },
              plugins: {
                legend: { position: "bottom" },
                datalabels: {
                  display: (context) =>
                    context.dataset.data[context.dataIndex] !== 0,
                  anchor: "end",
                  align: "top",
                  formatter: (value) => value,
                },
              },
              scales: {
                x: {
                  stacked: false,
                  ticks: {
                    maxRotation: 45,
                    minRotation: 30,
                  },
                },
                y: { beginAtZero: true, stacked: false },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BarangayDistribution;
