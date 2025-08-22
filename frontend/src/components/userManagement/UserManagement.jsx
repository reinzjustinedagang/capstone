import React, { useState, useMemo, useEffect } from "react";
import Button from "../UI/Button"; // Assuming you have a Button component
import Modal from "../UI/Modal"; // Assuming this is your general Modal component for all dialogs
import Modal2 from "../UI/Modal2";
import UserForm from "./UserForm";
import axios from "axios";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowDown,
  ArrowUp,
  History, // Added History for viewing login trails
  Loader2, // For loading indicators
  XCircle, // For error messages
  CheckCircle, // For success messages
} from "lucide-react";
import { NavLink } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For fetching errors or general API errors

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false); // Used for form/delete specific loading

  // --- States for the Notification Modal ---
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success"); // 'success' or 'error'

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All Roles");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [sortBy, setSortBy] = useState("username");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [pendingUpdatePayload, setPendingUpdatePayload] = useState(null);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Attempting to fetch users from: ${backendUrl}/api/user/`);
      const response = await axios.get(`${backendUrl}/api/user/`, {
        withCredentials: true,
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      let errorMessage = `Failed to load users: ${err.message}.`;
      if (err.code === "ERR_NETWORK") {
        errorMessage += ` Please ensure the backend server is running and accessible at ${backendUrl}/api/user/.`;
        errorMessage += ` Also, check your browser's developer console for CORS errors.`;
      } else if (err.response) {
        errorMessage += ` Server responded with status ${
          err.response.status
        }: ${err.response.data?.message || "Unknown error"}.`;
      }
      setError(errorMessage); // Set error for the main display if fetch fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [backendUrl]); // Added backendUrl to dependencies

  // --- Notification Handlers ---
  const showSuccessNotification = (message) => {
    setNotificationMessage(message);
    setNotificationType("success");
    setShowNotificationModal(true);
  };

  const showErrorNotification = (message) => {
    setNotificationMessage(message);
    setNotificationType("error");
    setShowNotificationModal(true);
  };

  const closeNotificationModal = () => {
    setShowNotificationModal(false);
    setNotificationMessage("");
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowAddModal(true);
    setError(null); // Clear any previous general errors when opening form
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
    setError(null); // Clear any previous general errors when opening form
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
    setError(null); // Clear any previous general errors when opening form
  };

  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);

    try {
      const updatePayload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        cp_number: formData.cp_number,
        role: formData.role,
      };
      let originalRole = null;

      if (formData.id) {
        const originalUser = users.find(
          (u) => String(u.id) === String(formData.id)
        );
        originalRole = originalUser?.role;
      }

      if (formData.id) {
        await axios.put(
          `${backendUrl}/api/user/update/${formData.id}`,
          updatePayload,
          { withCredentials: true }
        );
        showSuccessNotification("User updated successfully!");
      } else {
        await axios.post(
          `${backendUrl}/api/user/register`,
          {
            ...updatePayload,
          },
          { withCredentials: true }
        );
        showSuccessNotification("New user added successfully!");
      }

      await fetchUsers();

      const userObj = JSON.parse(localStorage.getItem("user"));
      const currentUserId = userObj?.id;

      if (
        formData.id &&
        currentUserId &&
        String(formData.id) === String(currentUserId) &&
        originalRole &&
        formData.role !== originalRole
      ) {
        setPendingUpdatePayload({
          updatePayload,
          formData,
        });
        setShowLogoutWarning(true);
        return;
      } else if (
        formData.id &&
        currentUserId &&
        String(formData.id) === String(currentUserId)
      ) {
        window.dispatchEvent(new Event("profileUpdated"));
      }

      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to save user:", err);
      const errorMessage =
        err.response?.data?.message ||
        `Failed to ${formData.id ? "update" : "add"} user. Please try again.`;
      showErrorNotification(errorMessage);
      // Removed the throw err; to prevent uncaught promise rejection in UI
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutWarning(false);
    window.dispatchEvent(new Event("profileUpdated"));
    try {
      await axios.post(
        `${backendUrl}/api/user/logout`,
        {},
        { withCredentials: true }
      );
    } catch (logoutErr) {
      console.error("Logout failed:", logoutErr);
      // Even if logout API fails, proceed with client-side logout
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login"; // Force full page reload to clear state
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutWarning(false);
    setPendingUpdatePayload(null);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleDeleteConfirm = async () => {
    setFormSubmitting(true);
    try {
      await axios.delete(`${backendUrl}/api/user/${selectedUser.id}`, {
        withCredentials: true,
      });
      showSuccessNotification("User deleted successfully!");
      await fetchUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to delete user. Please try again.";
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
        if (a[sortBy] > b[sortBy]) cmp = 1;
        else if (a[sortBy] < b[sortBy]) cmp = -1;
        cmp = a[sortBy] > b[sortBy] ? 1 : a[sortBy] < b[sortBy] ? -1 : 0;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return filteredUsers;
  }, [users, searchTerm, filterRole, filterStatus, sortBy, sortOrder]);

  return (
    <>
      <div className="flex justify-end items-center mb-4">
        <Button
          onClick={handleAddUser}
          variant="primary"
          icon={<Plus className="h-4 w-4 mr-2" />}
        >
          Add New User
        </Button>
      </div>

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
                      colSpan="6" // Adjusted colspan to match new column count
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                              : "bg-indigo-100 text-indigo-800"
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
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                            aria-label={`Edit ${user.username}`}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-900"
                            aria-label={`Delete ${user.username}`}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          {/* New Eye Icon for Login Trails */}
                          <NavLink
                            className="text-green-600 hover:text-green-900"
                            aria-label={`View login trails for ${user.username}`}
                            title="View Login Trails"
                            to={`/admin/login-trail/${user.id}`} // Adjusted to use user.id
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

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddModal(false);
            setSelectedUser(null);
          }}
          onSubmitSuccess={showSuccessNotification}
          onSubmitError={showErrorNotification}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSubmitSuccess={showSuccessNotification}
          onSubmitError={showErrorNotification}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
      >
        <div className="p-6">
          <p className="mb-4 text-gray-700">
            Are you sure you want to delete the user{" "}
            <span className="font-semibold text-red-600">
              {selectedUser ? selectedUser.username : "this user"}{" "}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}
              disabled={formSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={formSubmitting}
            >
              {formSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* --- Notification Modal --- */}
      <Modal
        isOpen={showNotificationModal}
        onClose={closeNotificationModal}
        title={notificationType === "success" ? "Success!" : "Error!"}
      >
        <div className="p-6 text-center">
          <div
            className={`text-lg font-semibold mb-4 ${
              notificationType === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {notificationMessage}
          </div>
          <Button
            variant={notificationType === "success" ? "primary" : "danger"}
            onClick={closeNotificationModal}
          >
            OK
          </Button>
        </div>
      </Modal>

      {/* --- Logout Warning Modal (for self-role change) --- */}
      <Modal
        isOpen={showLogoutWarning}
        onClose={handleCancelLogout}
        title="Role Change Detected"
      >
        <div className="p-6 text-center">
          <div className="text-lg font-semibold mb-4 text-red-700">
            You are changing your own role.
            <br />
            You will be logged out and must re-login to continue.
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button variant="secondary" onClick={handleCancelLogout}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmLogout}>
              Continue & Logout
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserManagement;
