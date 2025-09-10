import React, { useEffect, useState } from "react";
import axios from "axios";

const StatisticalSummary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/charts/summary`);
        console.log("📊 Summary Data:", res.data); // ✅ debug here
        setData(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch summary:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Loading statistical summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  // Extract gender counts
  const male_count = data.gender?.male_count ?? 0;
  const female_count = data.gender?.female_count ?? 0;
  const unknown_count = data.gender?.unknown_count ?? 0;

  // Total senior citizens
  const totalSeniors = male_count + female_count + unknown_count;

  // Active Members estimation (placeholder: ~80% of total)
  const activeMembers = Math.round(totalSeniors * 0.8);

  // Calculate average age
  const ageDist = data.age || {};
  const totalInBuckets = Object.values(ageDist).reduce(
    (sum, val) => sum + (val || 0),
    0
  );

  const avgAge =
    totalInBuckets > 0
      ? (
          (ageDist["60_65"] * 62.5 +
            ageDist["66_70"] * 68 +
            ageDist["71_75"] * 73 +
            ageDist["76_80"] * 78 +
            ageDist["81_85"] * 83 +
            ageDist["86_plus"] * 88) /
          totalInBuckets
        ).toFixed(1)
      : 0;

  // Example observation logic
  const keyObservations = [
    ageDist["66_70"] > ageDist["60_65"]
      ? "Majority are between 66-70 years old"
      : "Majority are between 60-65 years old",
    female_count > male_count
      ? "Female seniors slightly outnumber male seniors"
      : "Male seniors slightly outnumber female seniors",
    `${((activeMembers / totalSeniors) * 100).toFixed(
      1
    )}% of seniors are actively participating in programs`,
    (() => {
      if (data.barangay?.length) {
        const topBarangay = [...data.barangay].sort(
          (a, b) =>
            b.male_count + b.female_count - (a.male_count + a.female_count)
        )[0];
        return `${topBarangay.barangay} has the highest concentration of senior citizens`;
      }
      return "No barangay data available";
    })(),
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Statistical Summary</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Senior Citizens</p>
            <p className="text-2xl font-semibold">{totalSeniors}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Age</p>
            <p className="text-2xl font-semibold">{avgAge}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Members</p>
            <p className="text-2xl font-semibold">{activeMembers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">With Health Issues</p>
            <p className="text-2xl font-semibold">—</p>
          </div>
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Key Observations
          </h4>
          <ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
            {keyObservations.map((obs, idx) => (
              <li key={idx}>{obs}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StatisticalSummary;
