import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Edit,
  Trash,
  Loader2,
  ArrowDown,
  ArrowUp,
  SquareCheckBig,
  CircleCheckBig,
} from "lucide-react";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import userIcon from "../../assets/user.png";

const UnregisteredUserList = ({ onEdit }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveSuccessModal, setApproveSuccessModal] = useState(false);
  const [userToApprove, setUserToApprove] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("username");
  const [sortOrder, setSortOrder] = useState("asc");

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/user/unregistered`, {
        withCredentials: true,
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch unregistered users:", err);
      setError("Failed to fetch unregistered users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const confirmApproveUser = async () => {
    if (!userToApprove) return;
    setFormSubmitting(true);
    try {
      const response = await axios.put(
        `${backendUrl}/api/user/approve/${userToApprove.id}`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        setUsers(users.filter((u) => u.id !== userToApprove.id));
        setShowApproveModal(false);
        setApproveSuccessModal(true);
      }
    } catch (err) {
      console.error("Failed to approve user:", err);
      setError("Failed to approve user.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    setFormSubmitting(true);
    try {
      await axios.delete(`${backendUrl}/api/user/${selectedUser.id}`, {
        withCredentials: true,
      });
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
      setError("Failed to delete user.");
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
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter((user) =>
        Object.values(user).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
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
  }, [users, searchTerm, sortBy, sortOrder]);

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search unregistered users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500 flex justify-center items-center">
            <Loader2 className="animate-spin h-6 w-6 mr-3 text-blue-500" />
            Loading unregistered users...
          </div>
        ) : error ? (
          <div className="p-4 text-red-700 bg-red-100 border-l-4 border-red-500">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No unregistered users found.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={user.image || userIcon}
                          alt={user.username}
                          className="h-10 w-10 rounded-full object-cover border"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {user.username}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
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
                      <td className="px-6 py-4 text-sm font-medium flex space-x-3">
                        <button
                          onClick={() => {
                            setUserToApprove(user);
                            setShowApproveModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Approve"
                        >
                          <SquareCheckBig className="h-5 w-5" />
                        </button>

                        <button
                          onClick={() => onEdit(user.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        <div className="p-6">
          <p className="mb-4 text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-600">
              {selectedUser?.username}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={formSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteUser}
              disabled={formSubmitting}
            >
              {formSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Confirm Approval"
      >
        <div className="p-6">
          <p className="mb-4 text-gray-700">
            Are you sure you want to Register{" "}
            <span className="font-semibold text-gray-600">
              {userToApprove?.username}
            </span>
            ?
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowApproveModal(false)}
              disabled={formSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmApproveUser}
              disabled={formSubmitting}
            >
              {formSubmitting ? "Approving..." : "Approve"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={approveSuccessModal}
        onClose={() => setApproveSuccessModal(false)}
        title="User Approved"
      >
        <div className="p-6">
          <p className="text-gray-700">
            <span className="font-semibold">{userToApprove?.username}</span> has
            been successfully approved.
          </p>
          <div className="flex justify-end mt-4">
            <Button
              variant="primary"
              onClick={() => setApproveSuccessModal(false)}
            >
              OK
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UnregisteredUserList;
