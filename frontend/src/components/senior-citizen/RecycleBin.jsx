import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { ArchiveRestore, Trash, ArrowUp } from "lucide-react";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import { formatDistanceToNow } from "date-fns";

const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const RecycleBin = () => {
  const [deletedCitizens, setDeletedCitizens] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(""); // 'restore' | 'delete'
  const [confirmCitizenId, setConfirmCitizenId] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successType, setSuccessType] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  /** Fetch deleted citizens */
  const fetchDeletedCitizens = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${backendUrl}/api/senior-citizens/deleted`,
        {
          params: { page, limit },
          withCredentials: true,
        }
      );

      setDeletedCitizens(response.data.items || []);
      setTotalCount(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching deleted citizens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedCitizens();
  }, [page]);

  useEffect(() => {
    fetchDeletedCitizens();
  }, []);

  /** Confirm action */
  const confirmActionForCitizen = (id, actionType) => {
    setConfirmCitizenId(id);
    setConfirmAction(actionType);
    setShowConfirmModal(true);
  };

  /** Handle Restore */
  const handleRestore = async (id) => {
    setIsActionLoading(true);
    try {
      await axios.patch(
        `${backendUrl}/api/senior-citizens/restore/${id}`,
        {},
        { withCredentials: true }
      );
      await fetchDeletedCitizens();
      setSuccessType("restore");
      setSuccessMessage("Senior citizen record restored successfully!");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to restore:", err);
    } finally {
      setIsActionLoading(false);
    }
  };

  /** Handle Permanent Delete */
  const handlePermanentDelete = async (id) => {
    setIsActionLoading(true);
    try {
      await axios.delete(
        `${backendUrl}/api/senior-citizens/permanent-delete/${id}`,
        { withCredentials: true }
      );
      await fetchDeletedCitizens();
      setSuccessType("delete");
      setSuccessMessage("Record permanently deleted successfully!");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const renderPageButtons = () => {
    const visiblePages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      visiblePages.push(1);

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
        visiblePages.push(totalPages);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <NavLink
          to="/admin/senior-citizen-list"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowUp className="h-5 w-5 mr-2 -rotate-90" />
          Back to Senior Citizens
        </NavLink>
        <div className="text-sm text-gray-500">
          {deletedCitizens.length} deleted records
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <span className="text-gray-600">Loading records...</span>
          </div>
        ) : deletedCitizens.length === 0 ? (
          <div className="text-center py-12">
            <ArchiveRestore className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No deleted records
            </h3>
            <p className="text-gray-500">The recycle bin is empty.</p>
          </div>
        ) : (
          <>
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
                      Deleted Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deletedCitizens.map((citizen) => (
                    <tr key={citizen.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {citizen.lastName}, {citizen.firstName}{" "}
                        {citizen.middleName || ""} {citizen.suffix || ""}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {citizen.age}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {citizen.deleted_at
                          ? formatDistanceToNow(new Date(citizen.deleted_at), {
                              addSuffix: true,
                            })
                          : "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              confirmActionForCitizen(citizen.id, "restore")
                            }
                            className="text-green-600 hover:text-green-900"
                          >
                            <ArchiveRestore className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() =>
                              confirmActionForCitizen(citizen.id, "delete")
                            }
                            className="text-red-600 hover:text-red-900"
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

            {/* Pagination */}
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
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
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
                    <span className="font-medium">
                      {(page - 1) * limit + 1}
                    </span>{" "}
                    to{" "}
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
          </>
        )}
      </div>

      {/* Confirm Modal */}
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
              ? "Are you sure you want to restore this record?"
              : "This will permanently delete the record. Continue?"}
          </p>
          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction === "restore" ? "primary" : "danger"}
              disabled={isActionLoading}
              onClick={async () => {
                if (confirmAction === "restore") {
                  await handleRestore(confirmCitizenId);
                } else {
                  await handlePermanentDelete(confirmCitizenId);
                }
                setShowConfirmModal(false);
              }}
            >
              {isActionLoading
                ? confirmAction === "restore"
                  ? "Restoring..."
                  : "Deleting..."
                : confirmAction === "restore"
                ? "Restore"
                : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
      >
        <div className="p-6 text-center">
          <div
            className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${
              successType === "restore" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {successType === "restore" ? (
              <ArchiveRestore className="w-6 h-6 text-green-500" />
            ) : (
              <Trash className="w-6 h-6 text-red-500" />
            )}
          </div>
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
