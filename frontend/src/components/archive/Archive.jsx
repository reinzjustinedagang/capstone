import React, { useState, useEffect } from "react";
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
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";

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
  // Instead of sorting by lastName asc
  // Default: archive_date desc
  const [sortBy, setSortBy] = useState("archive_date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [showFilters, setShowFilters] = useState(false);

  const genderOptions = ["All", "Male", "Female"];
  const reasonOptions = ["All", "Delete", "Transferred", "Deceased", "Other"];

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
      console.warn("Failed to load archived citizens:", err.message);
      setError(""); // Don’t trigger global “Page failed to load” modal
      setArchivedCitizens([]);
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
      // In-app notifications are better than alert()
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
      await axios.delete(
        `${backendUrl}/api/senior-citizens/permanent-delete/${selectedCitizen.id}`,
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
    setSortBy("archive_date"); // ✅ Reset sort to default
    setSortOrder("desc"); // ✅ Reset order to default
    setShowFilters(false);
  };

  // Sorting
  const toggleSortOrder = (column) => {
    if (sortBy === column) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        // If already "desc" on Name, clear sort → fallback to archive_date
        if (column === "lastName") {
          setSortBy("archive_date");
          setSortOrder("desc");
        } else {
          setSortOrder("asc");
        }
      }
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
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
    filterReason,
    filterGender,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterBarangay, filterReason, filterGender]);

  // ─── Pagination Renderer ───────────────────────────────────────────
  const renderPageButtons = () => {
    const visiblePages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      visiblePages.push(1); // Always show first page

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
        visiblePages.push(totalPages); // Avoid duplicate if totalPages is already 1
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

  const columns = [
    { label: "Name", key: "lastName", sortable: true },
    { label: "Gender", key: "gender", sortable: false },
    { label: "Barangay", key: "barangay", sortable: false },
    { label: "Archive Reason", key: "archive_reason", sortable: false },
    { label: "Archived Date", key: "archive_date", sortable: false },
    { label: "Deceased Date", key: "deceased_date", sortable: false },
    { label: "Action", key: "action", sortable: false },
  ];

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
              filterReason !== "All" ||
              !(sortBy === "archive_date" && sortOrder === "desc")) && (
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
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && toggleSortOrder(col.key)}
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider 
    ${col.sortable ? "cursor-pointer text-gray-700" : "text-gray-500"}`}
                  >
                    <div className="flex items-center">
                      {col.label}
                      {col.sortable &&
                        sortBy === col.key &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 ml-1" />
                        ))}
                    </div>
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
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
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
                <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
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
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Deleted</h3>
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
