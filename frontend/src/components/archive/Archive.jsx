import React, { useState, useEffect } from "react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import Pagination from "../UI/Component/Pagination";
import SearchAndFilterBar from "../UI/Component/SearchAndFilterBar";
import axios from "axios";
import { Loader2, ArchiveRestore, Trash2, CheckCircle } from "lucide-react";

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
  const [filterAge, setFilterAge] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [sortBy, setSortBy] = useState("lastName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);

  const genderOptions = ["All", "Male", "Female"];
  const AgeOptions = [
    "All",
    "60 - 69",
    "70 - 79",
    "80 - 89",
    "90 - 99",
    "100+",
  ];

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
        ageRange: filterAge,
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
    setFilterAge("All");
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
        {/* Search + Filters */}
        <SearchAndFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filterAge={filterAge}
          setFilterAge={setFilterAge}
          filterGender={filterGender}
          setFilterGender={setFilterGender}
          filterBarangay={filterBarangay}
          setFilterBarangay={setFilterBarangay}
          clearFilters={clearFilters}
          AgeOptions={AgeOptions}
          genderOptions={genderOptions}
          barangayOptions={barangayOptions}
        />

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

      {/* Modals (Delete, Restore, Success) remain same */}
      {/* ... */}
    </div>
  );
};

export default Archive;
