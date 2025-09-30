import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const MessageHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/sms/history`, {
        params: { page, limit },
        withCredentials: true,
      });

      setLogs(res.data.logs || []);
      setTotalCount(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch SMS history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page]);

  /** Render numbered page buttons with ellipsis */
  const renderPageButtons = () => {
    const visiblePages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) visiblePages.push(i);
    } else {
      visiblePages.push(1);

      if (page > 3) visiblePages.push("ellipsis-prev");

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) visiblePages.push(i);
      }

      if (page < totalPages - 2) visiblePages.push("ellipsis-next");

      visiblePages.push(totalPages);
    }

    return visiblePages.map((p, index) =>
      p === "ellipsis-prev" || p === "ellipsis-next" ? (
        <span
          key={`ellipsis-${index}`}
          className="px-2 py-2 text-gray-500 text-sm select-none"
        >
          ...
        </span>
      ) : (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
            page === p
              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {p}
        </button>
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-medium">Message History</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500 text-sm"
                    >
                      <div className="flex justify-center items-center">
                        <Loader2 className="animate-spin h-6 w-6 text-blue-600 mr-2" />
                        Loading history...
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-gray-500 text-sm"
                    >
                      No messages found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const recipientCount = Array.isArray(log.recipients)
                      ? log.recipients.length
                      : log.recipients
                          ?.split(",")
                          .filter((r) => r.trim() !== "").length || 0;

                    return (
                      <tr key={log.id}>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {recipientCount} recipient
                          {recipientCount !== 1 ? "s" : ""}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {log.message}
                        </td>
                        <td className="px-6 py-4 text-sm">
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
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {log.sent_email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              log.sent_role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {log.sent_role
                              ? log.sent_role.charAt(0).toUpperCase() +
                                log.sent_role.slice(1)
                              : "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{(page - 1) * limit + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * limit, totalCount)}
                  </span>{" "}
                  of <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {renderPageButtons()}

                  <button
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default MessageHistory;
