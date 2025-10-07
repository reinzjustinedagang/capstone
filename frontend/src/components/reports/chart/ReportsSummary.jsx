import React, { useEffect, useState } from "react";

const ReportsSummary = ({ year = new Date().getFullYear() }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const endpoints = [
          "deceased",
          "transferees",
          "socpen",
          "non-socpen",
          "pdl",
          "new",
          "booklet",
          "utp",
          "pensioner",
          "remarks",
        ];

        const requests = endpoints.map((ep) =>
          fetch(`${backendUrl}/api/charts/${ep}?year=${year}`).then((res) =>
            res.json()
          )
        );

        const results = await Promise.all(requests);

        const formattedData = endpoints.reduce((acc, ep, idx) => {
          acc[ep] = results[idx];
          return acc;
        }, {});

        setData(formattedData);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError("Failed to load reports data");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [year, backendUrl]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Loading reports summary...</p>
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

  // Calculate totals
  const totalDeceased = data.deceased?.reduce(
    (sum, m) => sum + m.male + m.female,
    0
  );
  const totalTransferees = data.transferees?.reduce(
    (sum, m) => sum + m.male + m.female,
    0
  );
  const totalNew = data.new?.reduce((sum, m) => sum + m.male + m.female, 0);
  const totalSocPen = data.socpen?.reduce(
    (sum, m) => sum + m.male + m.female,
    0
  );
  const totalNonSocPen = data["non-socpen"]?.reduce(
    (sum, m) => sum + m.male + m.female,
    0
  );
  const totalPDL = data.pdl?.reduce((sum, m) => sum + m.male + m.female, 0);
  const totalBooklet = data.booklet?.reduce(
    (sum, m) => sum + m.male + m.female,
    0
  );
  const totalUTP = data.utp?.reduce((sum, m) => sum + m.male + m.female, 0);

  const totalPensioners = Object.values(data.pensioner || {}).reduce(
    (sum, val) => sum + val,
    0
  );

  const remarks = data.remarks || {};
  const topRemark = Object.entries(remarks).sort((a, b) => b[1] - a[1])[0];

  // Key observations
  const keyObservations = [
    `${totalNew} new senior citizens registered this year`,
    totalSocPen > 0
      ? `${totalSocPen} seniors receiving SocPen benefits`
      : "No SocPen beneficiaries recorded",
    topRemark
      ? `Most common remarks: ${topRemark[0]} (${topRemark[1]} seniors)`
      : "No health status data available",
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Reports Summary - {year}</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Deceased</p>
            <p className="text-2xl font-semibold">{totalDeceased}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Transferees</p>
            <p className="text-2xl font-semibold">{totalTransferees}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">New Registrations</p>
            <p className="text-2xl font-semibold">{totalNew}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Pensioners</p>
            <p className="text-2xl font-semibold">{totalPensioners}</p>
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

export default ReportsSummary;
