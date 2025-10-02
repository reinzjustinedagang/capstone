import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import userIcon from "../../assets/user.png";
import {
  Search,
  Plus,
  Edit,
  Ban,
  History,
  Loader2,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

const UserList = ({ onEdit }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All Roles");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [sortBy, setSortBy] = useState("username");
  const [sortOrder, setSortOrder] = useState("asc");

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/user/`, {
        withCredentials: true,
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      let errorMessage = `Failed to load users: ${err.message}.`;
      if (err.code === "ERR_NETWORK") {
        errorMessage += ` Please ensure the backend server is running and accessible.`;
      } else if (err.response) {
        errorMessage += ` Server responded with status ${err.response.status}.`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showSuccessNotification = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

  const showErrorNotification = (message) => {
    setNotificationMessage(message);
    setShowNotificationModal(true);
  };

  const handleBlockUser = (user) => {
    setSelectedUser(user);
    setShowBlockModal(true);
    setError(null);
  };

  const handleBlockConfirm = async () => {
    setFormSubmitting(true);
    try {
      await axios.put(
        `${backendUrl}/api/user/blocked/${selectedUser.id}`,
        {},
        { withCredentials: true }
      );

      showSuccessNotification("User blocked successfully!");
      await fetchUsers();
      setShowBlockModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to block user:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to block user.";
      showErrorNotification(errorMessage);
    } finally {
      setFormSubmitting(false);
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
    let filteredUsers = [...users];

    if (searchTerm) {
      filteredUsers = filteredUsers.filter((user) =>
        Object.values(user).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (filterRole !== "All Roles") {
      filteredUsers = filteredUsers.filter((user) => user.role === filterRole);
    }

    if (filterStatus !== "All Status") {
      filteredUsers = filteredUsers.filter(
        (user) => user.status === filterStatus
      );
    }

    filteredUsers.sort((a, b) => {
      let cmp = 0;
      if (typeof a[sortBy] === "string" && typeof b[sortBy] === "string") {
        cmp = a[sortBy].localeCompare(b[sortBy]);
      } else {
        cmp = a[sortBy] > b[sortBy] ? 1 : a[sortBy] < b[sortBy] ? -1 : 0;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return filteredUsers;
  }, [users, searchTerm, filterRole, filterStatus, sortBy, sortOrder]);

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
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
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All Status">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {error && (
          <div
            className="p-4 text-red-700 bg-red-100 border-l-4 border-red-500"
            role="alert"
          >
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="p-6 text-center text-gray-500 flex justify-center items-center">
            <Loader2 className="animate-spin h-6 w-6 mr-3 text-blue-500" />
            Loading users...
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
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSortOrder("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortBy === "status" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    <div className="flex items-center">Last Login</div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedUsers.length === 0 && !loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                        {/* User Image */}
                        <img
                          src={user.image || userIcon} // fallback if no image
                          alt={user.username}
                          className="h-10 w-10 rounded-full border-blue-800 object-cover border"
                        />

                        {/* Username */}
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status.charAt(0).toUpperCase() +
                            user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                          {user.last_login
                            ? new Date(user.last_login).toLocaleString()
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* Edit icon is visible but non-functional */}
                          <button
                            key={user.id}
                            className="text-blue-600 hover:text-blue-900"
                            aria-label={`Edit ${user.username}`}
                            onClick={() => onEdit(user.id)}
                            title="Update"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleBlockUser(user)}
                            className="text-gray-600 hover:text-gray-900"
                            aria-label={`Block ${user.username}`}
                            title="Block"
                          >
                            <Ban className="h-5 w-5" />
                          </button>
                          <NavLink
                            className="text-green-600 hover:text-green-900"
                            aria-label={`View login trails for ${user.username}`}
                            title="View Login Trails"
                            to={`/admin/login-trail/${user.id}`}
                          >
                            <History className="h-5 w-5" />
                          </NavLink>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination section remains intact */}
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
                of <span className="font-medium">{users.length}</span> results
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

      {/* Block confirmation modal */}
      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title="Confirm Block"
      >
        <div className="p-6">
          <p className="mb-4 text-gray-700">
            Are you sure you want to block{" "}
            <span className="font-semibold text-gray-600">
              {selectedUser ? selectedUser.username : "this user"}
            </span>
            ? This action will prevent them from accessing the system.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowBlockModal(false);
                setSelectedUser(null);
              }}
              disabled={formSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant=""
              onClick={handleBlockConfirm}
              disabled={formSubmitting}
            >
              {formSubmitting ? "Blocking..." : "Block"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserList;
