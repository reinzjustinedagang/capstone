import React, { useState, useEffect } from "react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import Pagination from "../UI/Component/Pagination";
import axios from "axios";
import { Loader2, ArchiveRestore, Trash2, CheckCircle } from "lucide-react";

const Archive = ({ onView }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [archivedCitizens, setArchivedCitizens] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoring, setRestoring] = useState(false); // NEW
  const [showRestoreSuccess, setShowRestoreSuccess] = useState(false); // NEW

  // Delete states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const fetchArchivedCitizens = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${backendUrl}/api/senior-citizens/archived?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );

      const { citizens, total, totalPages } = response.data;

      setArchivedCitizens(citizens || []);
      setTotalCount(total || 0);
      setTotalPages(totalPages || 1);
    } catch (err) {
      console.error(err);
      setError("Failed to load archived senior citizens.");
      setArchivedCitizens([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedCitizens();
  }, [page]);

  const handleRestore = async () => {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      await axios.put(
        `${backendUrl}/api/senior-citizens/archive/restore/${restoreTarget.id}`,
        {},
        { withCredentials: true }
      );
      setRestoreTarget(null);
      fetchArchivedCitizens(); // refresh
      setShowRestoreSuccess(true); // show success modal
    } catch (err) {
      console.error("Error restoring:", err);
      alert("Failed to restore citizen.");
    } finally {
      setRestoring(false);
    }
  };

  const handleDelete = (citizen) => {
    setSelectedCitizen(citizen);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await axios.patch(
        `${backendUrl}/api/senior-citizens/soft-delete/${selectedCitizen.id}`,
        {},
        { withCredentials: true }
      );
      await fetchArchivedCitizens(); // fixed
      setShowDeleteModal(false);
      setSelectedCitizen(null);
      setShowSuccessModal(true);
    } catch {
      setError("Failed to delete senior citizen record.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Name",
                  "Gender",
                  "Barangay",
                  "Archive Reason",
                  "Archived Date",
                  "Deceased Date",
                  "Action",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {archivedCitizens.length > 0 ? (
                archivedCitizens.map((citizen) => (
                  <tr key={citizen.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {`${citizen.lastName}, ${citizen.firstName} ${
                        citizen.middleName || ""
                      } ${citizen.suffix || ""}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {citizen.gender || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {citizen.barangay_id || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {citizen.archive_reason || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {citizen.archive_date
                        ? new Date(citizen.archive_date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {citizen.archive_date
                        ? new Date(citizen.deceased_date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "—"}
                    </td>
                    <td className="px-6 py-4 flex space-x-3">
                      <button
                        onClick={() => setRestoreTarget(citizen)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <ArchiveRestore className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(citizen)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {loading ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="ml-2 text-gray-600">
                          Loading Archived Citizens...
                        </p>
                      </div>
                    ) : (
                      error || "No archived senior citizens found."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          limit={limit}
          totalCount={totalCount}
          totalPages={totalPages}
          setPage={setPage}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
      >
        <div className="p-4">
          Permanently delete{" "}
          <strong>
            {selectedCitizen?.firstName} {selectedCitizen?.lastName}
          </strong>
          ?
        </div>
        <div className="flex justify-end space-x-3 p-4">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>

      {/* Success Modal (Delete) */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Success</h3>
          <p className="text-sm text-gray-600 mb-4">
            Senior Citizen deleted successfully!
          </p>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </div>
      </Modal>

      {/* Restore Confirmation Modal */}
      <Modal
        isOpen={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        title="Confirm Restore"
      >
        <div className="p-4">
          Restore{" "}
          <strong>
            {restoreTarget?.firstName} {restoreTarget?.lastName}
          </strong>
          ?
        </div>
        <div className="flex justify-end space-x-3 p-4">
          <Button variant="secondary" onClick={() => setRestoreTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRestore}
            disabled={restoring}
          >
            {restoring ? (
              <span className="flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Restoring...
              </span>
            ) : (
              "Restore"
            )}
          </Button>
        </div>
      </Modal>

      {/* Success Modal (Restore) */}
      <Modal
        isOpen={showRestoreSuccess}
        onClose={() => setShowRestoreSuccess(false)}
        title="Success"
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Success</h3>
          <p className="text-sm text-gray-600 mb-4">
            Senior Citizen restored successfully!
          </p>
          <Button
            variant="primary"
            onClick={() => setShowRestoreSuccess(false)}
          >
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Archive;
