import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { ArchiveRestore, Trash, ArrowUp } from "lucide-react";
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

  const handleRestore = async (idToRestore) => {
    // Pass the ID directly
    setSelectedCitizenId(idToRestore); // Store for potential future modal use, though not strictly needed here
    console.log("Restoring ID:", idToRestore);
    try {
      await axios.patch(
        `${backendUrl}/api/senior-citizens/restore/${idToRestore}`, // Use the passed ID
        {},
        { withCredentials: true }
      );
      // Removed fetchCitizens() - this component doesn't have it.
      // Call a function that informs the parent or reloads the main list
      fetchMainCitizensList(); // Call placeholder or actual function
      await fetchDeletedCitizens(); // Refresh the recycle bin list

      setNotificationMessage("Senior citizen record restored successfully!");
      setNotificationType("success");
      setShowNotificationModal(true);
    } catch (err) {
      console.error("Failed to restore:", err);
      setNotificationMessage("Failed to restore senior citizen record.");
      setNotificationType("error");
      setShowNotificationModal(true);
    }
  };

  const handlePermanentDelete = async (idToDelete) => {
    // Pass the ID directly
    setSelectedCitizenId(idToDelete); // Store for potential future modal use
    if (
      window.confirm(
        "This will permanently delete the record. This action cannot be undone. Are you sure?"
      )
    ) {
      try {
        await axios.delete(
          `${backendUrl}/api/senior-citizens/permanent-delete/${idToDelete}`, // Use the passed ID
          { withCredentials: true }
        );
        await fetchDeletedCitizens(); // Refresh the recycle bin list

        setNotificationMessage("Record permanently deleted.");
        setNotificationType("success");
        setShowNotificationModal(true);
      } catch (err) {
        console.error("Failed to permanently delete:", err);
        setNotificationMessage("Failed to permanently delete record.");
        setNotificationType("error");
        setShowNotificationModal(true);
      }
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
              <tbody className="bg-white divide-y divide-gray-200">
                {deletedCitizens.map((citizen) => (
                  <tr key={citizen.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {`${citizen.firstName} ${citizen.middleName || ""} ${
                          citizen.lastName
                        } ${citizen.suffix || ""}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {citizen.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {citizen.barangay}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {citizen.deleted_at
                        ? `${formatDistanceToNow(new Date(citizen.deleted_at), {
                            addSuffix: true,
                          })}`
                        : "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          // Pass the specific citizen.id to the handler
                          onClick={() => handleRestore(citizen.id)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        >
                          <ArchiveRestore className="h-4 w-4 mr-1" />
                          Restore
                        </button>
                        <button
                          // Pass the specific citizen.id to the handler
                          onClick={() => handlePermanentDelete(citizen.id)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Permanent Delete
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
    </div>
  );
};

export default RecycleBin;
