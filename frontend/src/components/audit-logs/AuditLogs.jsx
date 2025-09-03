import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Clock,
  User,
  Activity,
  ArrowDown,
  ArrowUp,
  Loader2,
  XCircle,
  ChevronDown,
  X,
} from "lucide-react";
import axios from "axios";

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [allActionTypes, setAllActionTypes] = useState(["All"]);
  const [allUsers, setAllUsers] = useState(["All"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUser, setFilterUser] = useState("All");
  const [filterRole, setFilterRole] = useState("All");
  const [filterActionType, setFilterActionType] = useState("All");
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/audit-logs/filters`
        );
        setAllActionTypes(["All", ...response.data.actions]);
        setAllUsers(["All", ...response.data.users]);
      } catch (err) {
        console.error("Failed to fetch filter options:", err);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `${backendUrl}/api/audit-logs/getAll`,
          {
            params: {
              page,
              limit,
              search: searchTerm,
              user: filterUser,
              userRole: filterRole,
              action: filterActionType,
              sortBy,
              sortOrder,
            },
          }
        );
        setAuditLogs(response.data.logs);
        setTotalCount(response.data.total);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
        setError("Failed to load audit logs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAuditLogs();
  }, [
    page,
    searchTerm,
    filterUser,
    filterRole,
    filterActionType,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterUser, filterActionType, filterRole]);

  const toggleSortOrder = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterUser("All");
    setFilterRole("All");
    setFilterActionType("All");
    setShowFilters(false);
  };

  const hasFilters =
    searchTerm !== "" ||
    filterUser !== "All" ||
    filterRole !== "All" ||
    filterActionType !== "All";

  const renderPageButtons = () => {
    const visiblePages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      visiblePages.push(1); // Always show first page

      if (page > 3) {
        visiblePages.push("ellipsis-prev");
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          visiblePages.push(i);
        }
      }

      if (page < totalPages - 2) {
        visiblePages.push("ellipsis-next");
      }

      if (totalPages !== 1) {
        visiblePages.push(totalPages); // Avoid duplicate if totalPages is already 1
      }
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
    <div className="bg-gray-100 min-h-screen rounded-lg font-inter">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Controls */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search logs..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

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
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                >
                  {allUsers.map((user) => (
                    <option key={user} value={user}>
                      {user === "All" ? "All Users" : user}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action Type
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={filterActionType}
                  onChange={(e) => setFilterActionType(e.target.value)}
                >
                  {allActionTypes.map((action) => (
                    <option key={action} value={action}>
                      {action === "All"
                        ? "All Actions"
                        : action.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Loading / Error */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            <p className="ml-3 text-gray-600">Loading audit logs...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mx-4 my-6 flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                    onClick={() => toggleSortOrder("timestamp")}
                  >
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" /> Timestamp
                      {sortBy === "timestamp" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                    onClick={() => toggleSortOrder("user")}
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" /> User
                      {sortBy === "user" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                    onClick={() => toggleSortOrder("action")}
                  >
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2" /> Action
                      {sortBy === "action" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">{log.user}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            log.action === "LOGIN"
                              ? "bg-blue-100 text-blue-800"
                              : log.action === "CREATE"
                              ? "bg-green-100 text-green-800"
                              : log.action === "UPDATE"
                              ? "bg-yellow-100 text-yellow-800"
                              : log.action === "DELETE"
                              ? "bg-red-100 text-red-800"
                              : log.action === "LOGOUT"
                              ? "bg-gray-300 text-black"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{log.userRole}</td>
                      <td className="px-6 py-4 text-sm">{log.details}</td>
                      <td className="px-6 py-4 text-sm">{log.ipAddress}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Basic Pagination (Placeholder) */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
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
}
