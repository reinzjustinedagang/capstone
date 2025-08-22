import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, XCircle } from "lucide-react"; // Import icons for better UI feedback

const MessageHistory = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Number of records per page
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${backendUrl}/api/sms/history?page=${page}&limit=${limit}`,
          { withCredentials: true }
        );

        console.log("SMS history response:", res.data);

        setLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
        setTotalCount(res.data.total || 0);
      } catch (err) {
        console.error("Error loading message history", err);
        setLogs([]);
        setError(
          err.response?.data?.message ||
            "Failed to load message history. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, limit, backendUrl]); // Add backendUrl to dependencies

  // Calculate total pages based on the totalCount fetched
  const totalPages = Math.ceil(totalCount / limit);

  const renderPageButtons = () => {
    const pages = [];
    const maxPageButtons = 5; // Total number of page buttons to display (e.g., 1 ... 4 5 6 ... 10)

    // Always include the first page
    if (totalPages > 0) {
      pages.push(1);
    }

    // Determine the range of pages around the current page
    let startPage = Math.max(2, page - Math.floor((maxPageButtons - 3) / 2));
    let endPage = Math.min(
      totalPages - 1,
      page + Math.ceil((maxPageButtons - 3) / 2)
    );

    // Adjust start/end if near boundaries
    if (
      page <= Math.floor(maxPageButtons / 2) + 1 &&
      totalPages > maxPageButtons
    ) {
      endPage = maxPageButtons - 1;
    } else if (
      page >= totalPages - Math.floor(maxPageButtons / 2) &&
      totalPages > maxPageButtons
    ) {
      startPage = totalPages - (maxPageButtons - 2);
    }

    // Add first ellipsis if necessary
    if (startPage > 2) {
      pages.push("ellipsis-start");
    }

    // Add pages in the calculated range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add second ellipsis if necessary
    if (endPage < totalPages - 1) {
      pages.push("ellipsis-end");
    }

    // Always include the last page, if it's not the same as the first or already included
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    // Remove duplicates and ensure order
    const uniquePages = Array.from(new Set(pages)).sort((a, b) => {
      if (typeof a === "string") return 1; // Ellipses go last in sort
      if (typeof b === "string") return -1;
      return a - b;
    });

    return uniquePages.map((p, index) => {
      if (typeof p === "string" && p.startsWith("ellipsis")) {
        return (
          <span
            key={`ellipsis-${p}-${index}`}
            className="px-2 py-2 text-gray-500 text-sm select-none"
          >
            ...
          </span>
        );
      }

      const isCurrentPage = page === p;
      const isFirstButton = index === 0;
      const isLastButton = index === uniquePages.length - 1;

      // Apply rounded corners only to the first and last actual buttons in the sequence
      let buttonClasses = `relative inline-flex items-center px-4 py-2 border text-sm font-medium
            ${
              isCurrentPage
                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }
            transition-colors duration-150 ease-in-out`;

      return (
        <button key={p} onClick={() => setPage(p)} className={buttonClasses}>
          {p}
        </button>
      );
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-lg font-medium mb-6">Message History</h2>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          <p className="ml-3 text-gray-600">Loading message history...</p>
        </div>
      ) : error ? (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center"
          role="alert"
        >
          <XCircle className="h-5 w-5 mr-2" />
          <span className="block sm:inline">{error}</span>
        </div>
      ) : logs.length === 0 ? (
        <p className="text-center text-gray-600 py-4">No message logs found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Date & Time", "Message", "Recipients", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {/* Safely parse JSON for recipients and display count */}
                      {log.recipients
                        ? JSON.parse(log.recipients).length
                        : 0}{" "}
                      recipients
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.status === "Success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalCount > limit && ( // Only show pagination if there's more than one page
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-b-xl">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{(page - 1) * limit + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * limit, totalCount)}
                  </span>{" "}
                  of <span className="font-medium">{totalCount}</span> results
                </p>

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
          )}
        </>
      )}
    </div>
  );
};

export default MessageHistory;
