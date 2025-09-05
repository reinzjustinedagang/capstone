import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../UI/Button";
import { Trash2, Unlock } from "lucide-react";
import Modal from "../UI/Modal";

const BlockedUsers = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(""); // "delete" or "unblock"
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchBlockedUsers = async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL;
      const { data } = await axios.get(`${backendUrl}/api/user/blocked`, {
        withCredentials: true,
      });
      setBlockedUsers(data);
    } catch (err) {
      console.error("Failed to fetch blocked users:", err);
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
      const backendUrl = import.meta.env.VITE_API_BASE_URL;
      if (actionType === "delete") {
        await axios.delete(`${backendUrl}/api/user/delete/${selectedUser.id}`, {
          withCredentials: true,
        });
      } else if (actionType === "unblock") {
        await axios.put(
          `${backendUrl}/api/user/unblock/${selectedUser.id}`,
          {},
          { withCredentials: true }
        );
      }
      fetchBlockedUsers(); // Refresh table
      setShowConfirmModal(false);
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(false);
      setSelectedUser(null);
      setActionType("");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4">Blocked Users</h1>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : blockedUsers.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No blocked users.</div>
      ) : (
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Role</th>
              <th className="border px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blockedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{user.username}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.role}</td>
                <td className="border px-4 py-2 flex justify-center gap-2">
                  <Button
                    variant="warning"
                    size="sm"
                    icon={<Unlock className="w-4 h-4" />}
                    onClick={() => handleActionClick(user, "unblock")}
                  >
                    Unblock
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => handleActionClick(user, "delete")}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Action"
      >
        <div className="p-6 text-center">
          <p className="mb-4">
            Are you sure you want to{" "}
            <span className="font-semibold">{actionType}</span>{" "}
            <span className="font-semibold">{selectedUser?.username}</span>?
          </p>
          <div className="flex justify-center gap-2">
            <Button
              variant="destructive"
              onClick={handleConfirmAction}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Yes"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BlockedUsers;
