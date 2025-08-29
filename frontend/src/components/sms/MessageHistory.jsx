import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

const MessageHistory = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${backendUrl}/api/sms/history?page=${page}&limit=${limit}`
      );
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Failed to fetch SMS history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const handlePrev = () => setPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setPage((p) => (p * limit < total ? p + 1 : p));

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium mb-4">Message History</h2>
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="animate-spin h-6 w-6 mr-2" />
          Loading...
        </div>
      ) : logs.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Recipient
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Message
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Sent At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {log.recipients}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {log.message}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${
                        log.status === "Sent"
                          ? "bg-green-500"
                          : log.status === "Failed"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={handleNext}
              disabled={page * limit >= total}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageHistory;
