import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

const RecentRegistrations = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/api/senior-citizens/new`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch recent registrations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Registrations</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Age
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Address
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Date Registered
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-6 text-sm text-center text-gray-500"
                >
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    <span className="ml-2 text-gray-600">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((citizen) => (
                <tr key={citizen.id} className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm">{citizen.name}</td>
                  <td className="px-4 py-3 text-sm">{citizen.age}</td>
                  <td className="px-4 py-3 text-sm">{citizen.address}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(citizen.dateRegistered).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-3 text-sm text-center text-gray-500"
                >
                  No recent registrations
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentRegistrations;
