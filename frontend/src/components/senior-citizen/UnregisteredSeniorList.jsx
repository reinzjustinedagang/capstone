import React, { useState, useEffect } from "react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import Pagination from "../UI/Component/Pagination";
import axios from "axios";
import { CheckCircle, Loader2, Trash2 } from "lucide-react";

const UnregisteredSeniorList = ({ onView, onRegister }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [seniorCitizens, setSeniorCitizens] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Barangay mapping
  const [barangayMap, setBarangayMap] = useState({});

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Fetch barangays for mapping
  const fetchBarangays = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/barangays/all`);
      const map = {};
      response.data.forEach((b) => {
        map[b.id] = b.barangay_name;
      });
      setBarangayMap(map);
    } catch (err) {
      console.error("Failed to fetch barangays:", err);
    }
  };

  const fetchUnregisteredCitizens = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${backendUrl}/api/senior-citizens/unregistered?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );

      const { citizens, total, totalPages } = response.data;

      setSeniorCitizens(
        (citizens || []).map((citizen) => ({
          ...citizen,
          form_data:
            typeof citizen.form_data === "string"
              ? JSON.parse(citizen.form_data || "{}")
              : citizen.form_data || {},
        }))
      );
      setTotalCount(total || 0);
      setTotalPages(totalPages || 1);
    } catch (err) {
      console.error(err);
      setError("Failed to load unregistered senior citizens.");
      setSeniorCitizens([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarangays();
    fetchUnregisteredCitizens();
  }, [page]);

  /** --------------------------
   * Delete senior citizen
   * -------------------------- */
  const confirmDelete = (citizen) => setDeleteTarget(citizen);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await axios.delete(
        `${backendUrl}/api/senior-citizens/permanent-delete/${deleteTarget.id}`,
        { withCredentials: true }
      );
      setDeleteTarget(null);
      setShowSuccessModal(true); // show success modal
      fetchUnregisteredCitizens(); // refresh list
    } catch (err) {
      console.error("Failed to delete senior citizen:", err);
      alert("Failed to delete senior citizen.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Age", "Gender", "Address", "Applied Date"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  )
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {seniorCitizens.length > 0 ? (
                seniorCitizens.map((citizen) => (
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
                      {citizen.gender}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {[
                        citizen.form_data?.street,
                        citizen.barangay_id
                          ? `Brgy. ${
                              barangayMap[citizen.barangay_id] || "Unknown"
                            }`
                          : citizen.form_data?.barangay
                          ? `Brgy. ${citizen.form_data?.barangay}`
                          : "",
                        citizen.form_data?.municipality,
                        citizen.form_data?.province,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(citizen.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm font-xs">
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          onClick={() => onView(citizen.id)}
                        >
                          View
                        </Button>
                        <button
                          onClick={() => confirmDelete(citizen)}
                          className="text-red-600 hover:text-red-900"
                          aria-label={`Delete ${citizen.firstName} ${citizen.lastName}`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {loading ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="ml-2 text-gray-600">
                          Loading Senior Citizen...
                        </p>
                      </div>
                    ) : (
                      error || "No unregistered senior citizens found."
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
          setPage={setPage}
        />
      </div>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Delete"
      >
        <div className="p-4 text-gray-700">
          Are you sure you want to permanently delete{" "}
          <strong>
            {deleteTarget?.firstName} {deleteTarget?.lastName}
          </strong>
          ?
        </div>
        <div className="flex justify-end space-x-3 p-4">
          <Button
            variant="secondary"
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Deleted</h3>
          <p className="text-sm text-gray-600 mb-4">
            Senior citizen deleted successfully.
          </p>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UnregisteredSeniorList;
