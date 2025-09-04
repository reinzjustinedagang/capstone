import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { ArchiveRestore, Trash, ArrowUp, CheckCircle } from "lucide-react";
// Assuming you have a Modal component for notifications
import Modal from "../UI/Modal"; // Adjust path if necessary
import Button from "../UI/Button"; // Assuming you have a Button component
import { formatDistanceToNow } from "date-fns";

const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const RecycleBin = () => {
  const [deletedCitizens, setDeletedCitizens] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState(""); // 'success' or 'error'
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedCitizenId, setSelectedCitizenId] = useState(null); // New state to hold ID for modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(""); // 'restore' or 'delete'
  const [confirmCitizenId, setConfirmCitizenId] = useState(null);
  const [successType, setSuccessType] = useState(""); // 'restore' or 'delete'

  // Custom message

  const fetchDeletedCitizens = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/senior-citizens/deleted`,
        {
          withCredentials: true,
        }
      );
      setDeletedCitizens(response.data);
    } catch (error) {
      console.error("Error fetching deleted citizens:", error);
      setNotificationMessage("Failed to fetch deleted records.");
      setNotificationType("error");
      setShowNotificationModal(true);
    }
  };

  useEffect(() => {
    fetchDeletedCitizens();
  }, []); // Run only once on component mount

  // You also need to re-fetch main list after restore/delete from Recycle Bin
  // This function might need to be passed down as a prop or use a global state management
  // For now, I'll add a placeholder, assuming you have access to `fetchCitizens` from the parent (SeniorCitizen component)
  // If not, you might need to navigate back or refresh the whole page for the main list to update.
  const fetchMainCitizensList = () => {
    // This function would typically be passed from the parent SeniorCitizen component
    // For now, we'll just log a reminder.
    console.log(
      "Reminder: Implement re-fetching of main senior citizens list."
    );
    // Example: window.location.reload(); // Not ideal, but simple for immediate test
  };

  const confirmActionForCitizen = (id, actionType) => {
    setConfirmCitizenId(id);
    setConfirmAction(actionType); // 'restore' or 'delete'
    setShowConfirmModal(true);
  };

  const handleRestore = async (idToRestore) => {
    setSelectedCitizenId(idToRestore);
    try {
      await axios.patch(
        `${backendUrl}/api/senior-citizens/restore/${idToRestore}`,
        {},
        { withCredentials: true }
      );
      await fetchDeletedCitizens();

      // Show success modal with restore icon
      setSuccessType("restore");
      setSuccessMessage("Senior citizen record restored successfully!");
      setShowSuccessModal(true);

      fetchMainCitizensList();
    } catch (err) {
      console.error("Failed to restore:", err);
      setNotificationMessage("Failed to restore senior citizen record.");
      setNotificationType("error");
      setShowNotificationModal(true);
    }
  };

  const handlePermanentDelete = async (idToDelete) => {
    setSelectedCitizenId(idToDelete);
    try {
      await axios.delete(
        `${backendUrl}/api/senior-citizens/permanent-delete/${idToDelete}`,
        { withCredentials: true }
      );
      await fetchDeletedCitizens();

      // Show success modal with delete icon
      setSuccessType("delete");
      setSuccessMessage("Record permanently deleted successfully!");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to permanently delete:", err);
      setNotificationMessage("Failed to permanently delete record.");
      setNotificationType("error");
      setShowNotificationModal(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <NavLink
            to="/admin/senior-citizen-list"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowUp className="h-5 w-5 mr-2 -rotate-90" />
            Back to Senior Citizens
          </NavLink>
        </div>
        <div className="text-sm text-gray-500">
          {deletedCitizens.length} deleted records
        </div>
      </div>

      {/* Recycle Bin Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {deletedCitizens.length === 0 ? (
          <div className="text-center py-12">
            <ArchiveRestore className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No deleted records
            </h3>
            <p className="text-gray-500">The recycle bin is empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table Header */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barangay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deleted Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {deletedCitizens.map((citizen) => (
                  <tr key={citizen.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {`${citizen.lastName}, ${citizen.firstName} ${
                        citizen.middleName || ""
                      } ${citizen.suffix || ""}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {citizen.age}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {citizen.barangay_id
                        ? barangayMap[citizen.barangay_id] || "Unknown"
                        : citizen.barangay || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {citizen.deleted_at
                        ? formatDistanceToNow(new Date(citizen.deleted_at), {
                            addSuffix: true,
                          })
                        : "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm font-xs">
                      <div className="flex space-x-2">
                        {/* Restore Icon */}
                        <button
                          onClick={() =>
                            confirmActionForCitizen(citizen.id, "restore")
                          }
                          className="text-green-600 hover:text-green-900"
                          aria-label={`Restore ${citizen.firstName} ${citizen.lastName}`}
                        >
                          <ArchiveRestore className="h-5 w-5" />
                        </button>

                        {/* Permanent Delete Icon */}
                        <button
                          onClick={() =>
                            confirmActionForCitizen(citizen.id, "delete")
                          }
                          className="text-red-600 hover:text-red-900"
                          aria-label={`Delete ${citizen.firstName} ${citizen.lastName}`}
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={
          confirmAction === "restore" ? "Confirm Restore" : "Confirm Delete"
        }
      >
        <div className="p-6 text-center">
          <p className="text-gray-700 mb-4">
            {confirmAction === "restore"
              ? "Are you sure you want to restore this senior citizen record?"
              : "This will permanently delete the record. This action cannot be undone. Are you sure?"}
          </p>
          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction === "restore" ? "primary" : "danger"}
              onClick={async () => {
                setShowConfirmModal(false);
                if (confirmAction === "restore") {
                  await handleRestore(confirmCitizenId);
                } else if (confirmAction === "delete") {
                  await handlePermanentDelete(confirmCitizenId);
                }
              }}
            >
              {confirmAction === "restore" ? "Restore" : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Notification Modal */}
      <Modal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
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
            onClick={() => setShowNotificationModal(false)}
          >
            OK
          </Button>
        </div>
      </Modal>

      {/* --- SUCCESS MODAL --- */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
      >
        <div className="p-6 text-center">
          <div
            className={`mx-auto mb-4 w-12 h-12  rounded-full flex items-center justify-center ${
              successType === "restore" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {successType === "restore" ? (
              <ArchiveRestore className="w-6 h-6 text-green-500" />
            ) : (
              <Trash className="w-6 h-6 text-red-500" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Success</h3>
          <p className="text-sm text-gray-600 mb-4">{successMessage}</p>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default RecycleBin;
