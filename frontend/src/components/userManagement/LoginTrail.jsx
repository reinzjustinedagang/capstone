import React, { useEffect, useState, useMemo } from "react";
import { NavLink, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowUp, Clock, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const LoginTrail = () => {
  const { userId } = useParams();
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const fetchLoginTrails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${backendUrl}/api/audit-logs/${userId}`
      );
      setTrails(response.data || []);
      setTotalPages(Math.ceil((response.data?.length || 0) / limit));
    } catch (err) {
      console.error("Error fetching login trails:", err);
      setTrails([]); // keep empty state instead of showing error
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchLoginTrails();
  }, [userId]);

  const currentRecords = useMemo(() => {
    const start = (page - 1) * limit;
    return trails.slice(start, start + limit);
  }, [trails, page]);

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
      for (let i = start; i <= end; i++) visiblePages.push(i);
      if (page < totalPages - 2) visiblePages.push("ellipsis-next");
      visiblePages.push(totalPages);
    }

    return visiblePages.map((p, i) =>
      typeof p === "string" ? (
        <span key={i} className="px-2 py-2 text-gray-500 text-sm select-none">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <NavLink
          to="/admin/user-management"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowUp className="h-5 w-5 mr-2 -rotate-90" />
          Back to Users Management
        </NavLink>
        <div className="text-sm text-gray-500">
          {trails.length} login records
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={2}
                    className="text-center py-6 text-gray-500 flex justify-center items-center space-x-2"
                  >
                    <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                    <span>Loading login trails...</span>
                  </td>
                </tr>
              ) : currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center py-6 text-gray-500">
                    No login records found.
                  </td>
                </tr>
              ) : (
                currentRecords.map((trail) => (
                  <tr key={trail.id}>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>
                          {formatDistanceToNow(new Date(trail.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {trail.action || "Unknown"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && trails.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="ml-3 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * limit, trails.length)}
                </span>{" "}
                of <span className="font-medium">{trails.length}</span> results
              </p>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>

                {renderPageButtons()}

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginTrail;
