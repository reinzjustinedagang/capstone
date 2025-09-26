import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import {
  Search,
  Trash2,
  Unlock,
  Loader2,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

const BlockedUsers = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(""); // "delete" or "unblock"
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // UI state for search/filter/sort
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All Roles");
  const [sortBy, setSortBy] = useState("username");
  const [sortOrder, setSortOrder] = useState("asc");

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const fetchBlockedUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/blocked`, {
        withCredentials: true,
      });
      setBlockedUsers(data);
    } catch (err) {
      // Optionally show an error notification
      setBlockedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const handleActionClick = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      if (actionType === "delete") {
        await axios.delete(`${backendUrl}/api/user/${selectedUser.id}`, {
          withCredentials: true,
        });
      } else if (actionType === "unblock") {
        await axios.put(
          `${backendUrl}/api/user/unblock/${selectedUser.id}`,
          {},
          { withCredentials: true }
        );
      }
      // Refresh table
      await fetchBlockedUsers();
      setShowConfirmModal(false);
      setSelectedUser(null);
      setActionType("");
    } catch (err) {
      console.error("Action failed:", err);
      alert(
        `Failed to ${actionType === "unblock" ? "unblock" : "delete"} user: ${
          err.response?.data?.message || err.message
        }`
      );
      // Keep modal open, but allow buttons to be clickable again
    } finally {
      setActionLoading(false); // ✅ re-enable buttons even on failure
    }
  };

  const toggleSortOrder = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...blockedUsers];

    if (searchTerm) {
      filtered = filtered.filter((user) =>
        Object.values(user).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (filterRole !== "All Roles") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    filtered.sort((a, b) => {
      let cmp = 0;
      if (typeof a[sortBy] === "string" && typeof b[sortBy] === "string") {
        cmp = a[sortBy].localeCompare(b[sortBy]);
      } else {
        cmp = a[sortBy] > b[sortBy] ? 1 : a[sortBy] < b[sortBy] ? -1 : 0;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return filtered;
  }, [blockedUsers, searchTerm, filterRole, sortBy, sortOrder]);

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search blocked users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          {/* Filter */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="All Roles">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>

        {/* Table or loading/error message */}
        {loading ? (
          <div className="p-6 text-center text-gray-500 flex justify-center items-center">
            <Loader2 className="animate-spin h-6 w-6 mr-3 text-blue-500" />
            Loading blocked users...
          </div>
        ) : filteredAndSortedUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No blocked users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSortOrder("username")}
                  >
                    <div className="flex items-center">
                      Name
                      {sortBy === "username" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSortOrder("email")}
                  >
                    <div className="flex items-center">
                      Email
                      {sortBy === "email" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSortOrder("role")}
                  >
                    <div className="flex items-center">
                      Role
                      {sortBy === "role" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 justify-center">
                        <button
                          className="text-green-600 hover:text-green-900"
                          title="Unblock"
                          onClick={() => handleActionClick(user, "unblock")}
                        >
                          <Unlock className="w-5 h-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleActionClick(user, "delete")}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination (static, can add real logic if needed) */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">
                  {filteredAndSortedUsers.length}
                </span>{" "}
                of <span className="font-medium">{blockedUsers.length}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Previous</span>
                  Previous
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Next</span>
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Action"
      >
        <div className="p-6 text-center">
          <p className="mb-4 text-gray-700">
            Are you sure you want to{" "}
            <span className="font-semibold text-blue-600">
              {actionType === "unblock" ? "unblock" : "delete"}
            </span>{" "}
            <span className="font-semibold text-gray-600">
              {selectedUser?.username}
            </span>
            ?
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "delete" ? "danger" : "primary"}
              onClick={handleConfirmAction}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Yes"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BlockedUsers;
