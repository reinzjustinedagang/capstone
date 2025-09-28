import React, { useState, useEffect } from "react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import Pagination from "../UI/Component/Pagination";
import SearchAndFilterBar from "../UI/Component/SearchAndFilterBar";
import axios from "axios";
import {
  Search,
  Filter,
  ChevronDown,
  X,
  Loader2,
  ArchiveRestore,
  Trash2,
  CheckCircle,
} from "lucide-react";

const Archive = ({ onView }) => {
  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Data states
  const [archivedCitizens, setArchivedCitizens] = useState([]);
  const [barangayMap, setBarangayMap] = useState({});
  const [barangayOptions, setBarangayOptions] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBarangay, setFilterBarangay] = useState("All Barangays");
  const [filterReason, setFilterReason] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [sortBy, setSortBy] = useState("lastName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);

  const genderOptions = ["All", "Male", "Female"];
  const reasonOptions = ["All", "Deceased", "Delete", "Other"];

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Restore/Delete states
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [showRestoreSuccess, setShowRestoreSuccess] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ─── Fetch Barangays ──────────────────────────────────────────────
  const fetchBarangays = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/barangays/all`);
      const map = {};
      response.data.forEach((b) => {
        map[b.id] = b.barangay_name;
      });
      setBarangayMap(map);
      setBarangayOptions([
        "All Barangays",
        ...response.data.map((b) => b.barangay_name),
      ]);
    } catch (err) {
      console.error("Failed to fetch barangays:", err);
    }
  };

  // ─── Fetch Archived Citizens ──────────────────────────────────────
  const fetchArchivedCitizens = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit,
        search: searchTerm,
        barangay: filterBarangay,
        gender: filterGender,
        reason: filterReason, // ✅ use archive reason
        sortBy,
        sortOrder,
      };

      const response = await axios.get(
        `${backendUrl}/api/senior-citizens/archived`,
        { params, withCredentials: true }
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

  // ─── Handlers ─────────────────────────────────────────────────────
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
      fetchArchivedCitizens();
      setShowRestoreSuccess(true);
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
      await fetchArchivedCitizens();
      setShowDeleteModal(false);
      setSelectedCitizen(null);
      setShowSuccessModal(true);
    } catch {
      setError("Failed to delete senior citizen record.");
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterBarangay("All Barangays");
    setFilterReason("All");
    setFilterGender("All");
    setShowFilters(false);
  };

  // ─── Effects ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchBarangays();
  }, []);

  useEffect(() => {
    fetchArchivedCitizens();
  }, [
    page,
    searchTerm,
    filterBarangay,
    filterAge,
    filterGender,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterBarangay, filterAge, filterGender]);

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header Controls */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search archived citizens..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          {/* Filter Toggle + Clear */}
          <div className="flex items-center gap-4">
            <button
              className={`flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors ${
                showFilters ? "text-gray-900 font-semibold" : ""
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Advanced Filters
              <ChevronDown
                className={`h-4 w-4 ml-1 transform transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            {(searchTerm ||
              filterBarangay !== "All Barangays" ||
              filterGender !== "All" ||
              filterAge !== "All") && (
              <button
                onClick={clearFilters}
                className="flex items-center text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barangay
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={filterBarangay}
                  onChange={(e) => setFilterBarangay(e.target.value)}
                >
                  {barangayOptions.map((barangay) => (
                    <option key={barangay} value={barangay}>
                      {barangay}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                >
                  {genderOptions.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Archive Reason
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={filterReason}
                  onChange={(e) => setFilterReason(e.target.value)}
                >
                  {reasonOptions.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
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
                      {citizen.barangay_id
                        ? `Brgy. ${
                            barangayMap[citizen.barangay_id] || "Unknown"
                          }`
                        : citizen.form_data?.barangay
                        ? `Brgy. ${citizen.form_data?.barangay}`
                        : "-"}
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
                      {citizen.deceased_date
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
                    colSpan="7"
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
