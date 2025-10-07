import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Search, Filter, ChevronDown, X } from "lucide-react";

const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const MessageHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filterRole, setFilterRole] = useState("All");
  const [filterEmail, setFilterEmail] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [allUsers, setAllUsers] = useState(["All"]);
  const [showFilters, setShowFilters] = useState(false);

  // Current logged in user
  const [currentRole, setCurrentRole] = useState(null);

  useEffect(() => {
    const fetchUserAndFilters = async () => {
      try {
        // ✅ Fetch current user session
        const userRes = await axios.get(`${backendUrl}/api/user/me`, {
          withCredentials: true,
        });
        setCurrentRole(userRes.data?.role || "staff");

        // ✅ Fetch filters only if admin
        if (userRes.data?.role === "admin") {
          const response = await axios.get(`${backendUrl}/api/sms/filters`, {
            withCredentials: true,
          });
          setAllUsers(["All", ...response.data.users]);
        }
      } catch (err) {
        console.error("Failed to fetch user or filter options:", err);
      }
    };

    fetchUserAndFilters();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/sms/history`, {
        params: {
          page,
          limit,
          role: filterRole,
          email: filterEmail,
          status: filterStatus,
        },
        withCredentials: true,
      });

      setLogs(res.data.logs || []);
      setTotalCount(res.data.total || 0);
      setTotalPages(Math.ceil((res.data.total || 0) / limit));
    } catch (err) {
      console.error("Failed to fetch SMS history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRole) fetchHistory();
  }, [page, filterRole, filterEmail, filterStatus, currentRole]);

  useEffect(() => {
    setPage(1);
  }, [filterRole, filterEmail, filterStatus]);

  const clearFilters = () => {
    setFilterRole("All");
    setFilterEmail("All");
    setFilterStatus("All");
    setShowFilters(false);
  };

  const hasFilters =
    filterRole !== "All" || filterEmail !== "All" || filterStatus !== "All";

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
    <div className="p-6">
      {/* Header Controls */}
      <div className="p-4 border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        <h2 className="text-lg font-medium">Message History</h2>

        {/* Filter Toggle + Clear */}
        <div className="flex items-center gap-4">
          <button
            className={`flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors ${
              showFilters ? "text-gray-900 font-semibold" : ""
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Advanced Filters
            <ChevronDown
              className={`h-4 w-4 ml-1 transform transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <div className="p-4 border rounded-t-xl border-gray-200 ">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* ✅ Only show if admin */}
            {currentRole === "admin" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={filterEmail}
                    onChange={(e) => setFilterEmail(e.target.value)}
                  >
                    {allUsers.map((user) => (
                      <option key={user} value={user}>
                        {user === "All" ? "All Emails" : user}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="All">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </>
            )}

            {/* Status Filter (always shown) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="All">All Status</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-b-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
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
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500 text-sm"
                  >
                    No messages found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const recipientCount = Array.isArray(log.recipients)
                    ? log.recipients.length
                    : log.recipients?.split(",").filter((r) => r.trim() !== "")
                        .length || 0;

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
                            log.status === "Success"
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
                <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
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
      </div>
    </div>
  );
};

export default MessageHistory;
