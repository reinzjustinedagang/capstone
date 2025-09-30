import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "../UI/Button";
import Delete from "../UI/Button/Delete";
import Modal from "../UI/Modal";
import Pagination from "../UI/Component/Pagination";
import SearchAndFilterBar from "../UI/Component/SearchAndFilterBar";
import {
  Edit,
  Trash2,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  MoreVertical,
  XCircle,
  Loader2,
  ChevronUp,
  Archive,
  IdCard,
} from "lucide-react";

const SeniorCitizenList = ({ onEdit, onId }) => {
  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Data states
  const [seniorCitizens, setSeniorCitizens] = useState([]);
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
  const [filterHealthStatus, setFilterHealthStatus] = useState("All Remarks");
  const [filterPensioner, setFilterPensioner] = useState("All Pensioner");
  const [healthStatusOptions, setHealthStatusOptions] = useState([
    "All Remarks",
  ]);

  const [filterAge, setFilterAge] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [sortBy, setSortBy] = useState("lastName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Delete states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Archive states
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveDetails, setArchiveDetails] = useState({
    reason: "",
  });
  const [archiving, setArchiving] = useState(false);
  const [selectedArchiveCitizen, setSelectedArchiveCitizen] = useState(null);

  const fetchRemarks = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/senior-citizens/filters/remarks`
      );
      setHealthStatusOptions(["All Remarks", ...response.data]);
    } catch (err) {
      console.error("❌ Failed to fetch remarks:", err);
    }
  };

  useEffect(() => {
    fetchBarangays();
    fetchRemarks();
  }, []);

  // Fetch Citizens
  const fetchCitizens = async () => {
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
        healthStatus: filterHealthStatus,
        pensioner: filterPensioner,
        sortBy,
        sortOrder,
      };

      const response = await axios.get(
        `${backendUrl}/api/senior-citizens/page`,
        {
          params,
          withCredentials: true,
        }
      );

      setSeniorCitizens(
        response.data.citizens.map((citizen) => ({
          ...citizen,
          form_data:
            typeof citizen.form_data === "string"
              ? JSON.parse(citizen.form_data || "{}")
              : citizen.form_data || {},
        }))
      );
      setTotalCount(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch {
      setError("Failed to load senior citizens. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Barangays
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
    } catch {
      // ignore errors
    }
  };

  // Handle delete
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
      await fetchCitizens();
      setShowDeleteModal(false);
      setSelectedCitizen(null);
      setShowSuccessModal(true);
    } catch {
      setError("Failed to delete senior citizen record.");
    } finally {
      setDeleting(false);
    }
  };

  // Sorting
  const toggleSortOrder = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterBarangay("All Barangays");
    setFilterHealthStatus("All Remarks");
    setFilterPensioner("All Pensions");
    setFilterAge("All");
    setFilterGender("All");
    setShowFilters(false);
  };

  // Options

  const genderOptions = ["All", "Male", "Female"];
  const AgeOptions = [
    "All",
    "60 - 69",
    "70 - 79",
    "80 - 89",
    "90 - 99",
    "100 - 100+",
  ];

  const pensionOptions = ["All Pensions", "GSIS", "SSS", "PVAO", "PWD", "NONE"];

  // Effects
  useEffect(() => {
    fetchCitizens();
  }, [
    page,
    searchTerm,
    filterBarangay,
    filterHealthStatus,
    filterPensioner,
    filterAge,
    filterGender,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterBarangay, filterHealthStatus, filterAge, filterGender]);

  useEffect(() => {
    fetchBarangays();
  }, []);

  return (
    <div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Search and Filters */}
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
          filterHealthStatus={filterHealthStatus}
          setFilterHealthStatus={setFilterHealthStatus}
          filterPensioner={filterPensioner}
          setFilterPensioner={setFilterPensioner}
          clearFilters={clearFilters}
          AgeOptions={AgeOptions}
          genderOptions={genderOptions}
          barangayOptions={barangayOptions}
          healthStatusOptions={healthStatusOptions}
          pensionOptions={pensionOptions}
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                {[
                  { label: "Name", key: "lastName" },
                  { label: "Age", key: "age" },
                  { label: "Gender", key: "gender" },
                  { label: "Address", key: "barangay" },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSortOrder(col.key)}
                  >
                    <div className="flex items-center">
                      {col.label}
                      {sortBy === col.key &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 ml-1" />
                        ))}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pension
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {seniorCitizens.length > 0 ? (
                seniorCitizens.map((citizen) => (
                  <tr key={citizen.id}>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {citizen.form_data?.idNumber}
                    </td>
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
                        .filter(Boolean) // remove empty/undefined/null values
                        .join(", ")}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {citizen.form_data?.mobileNumber}
                    </td>
                    <td className="px-6 py-4">{citizen.form_data?.remarks}</td>
                    <td className="px-6 py-4">
                      {citizen.form_data?.pensioner}
                    </td>
                    <td className="px-6 py-4 text-sm font-xs">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(citizen.id)}
                          className="text-blue-600 hover:text-blue-900"
                          aria-label={`Edit ${citizen.firstName} ${citizen.lastName}`}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        {/* <button
                          onClick={() => handleDelete(citizen)}
                          className="text-red-600 hover:text-red-900"
                          aria-label={`Delete ${citizen.firstName} ${citizen.lastName}`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button> */}

                        {/* More options dropdown */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenDropdownId(
                                openDropdownId === citizen.id
                                  ? null
                                  : citizen.id
                              )
                            }
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            {openDropdownId === citizen.id ? (
                              <ChevronUp className="w-5 h-5 text-gray-600" />
                            ) : (
                              <MoreVertical className="w-5 h-5 text-gray-600" />
                            )}
                          </button>

                          {openDropdownId === citizen.id && (
                            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 transition ease-in-out">
                              <button
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  onId(citizen);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-600 hover:text-white"
                              >
                                <IdCard className="h-4 w-4 mr-2" />
                                Generate ID
                              </button>

                              <button
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  setSelectedArchiveCitizen(citizen);
                                  setShowArchiveModal(true);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-600 hover:text-white"
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
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
                      "No senior citizens found."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer (Audit Logs style) */}
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
                <span className="font-medium">
                  {totalCount === 0 ? 0 : (page - 1) * limit + 1}
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
                {/* Previous */}
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pageNum
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    (pageNum === page - 2 && page > 3) ||
                    (pageNum === page + 2 && page < totalPages - 2)
                  ) {
                    return (
                      <span
                        key={pageNum}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                {/* Next */}
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
        <Delete
          selectedCitizen={selectedCitizen}
          setShowDeleteModal={setShowDeleteModal}
          handleDeleteConfirm={handleDeleteConfirm}
          deleting={deleting}
        />
      </Modal>

      {/* Success Modal */}
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

      {/* Archive Modal */}
      {/* Archive Modal */}
      <Modal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        title="Archive Senior Citizen"
      >
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Please provide archive details for{" "}
            <strong>
              {selectedArchiveCitizen?.firstName}{" "}
              {selectedArchiveCitizen?.lastName}
            </strong>
            .
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>

            {/* Dropdown */}
            <select
              value={archiveDetails.reason}
              onChange={(e) =>
                setArchiveDetails({
                  ...archiveDetails,
                  reason: e.target.value,
                })
              }
              className="w-full border rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="">Select a reason</option>
              <option value="Delete">Delete</option>
              <option value="Transferred">Transferred</option>
              <option value="Deceased">Deceased</option>
              <option value="Other">Other</option>
            </select>

            {/* If Deceased → Date Picker */}
            {archiveDetails.reason === "Deceased" && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Death
                </label>
                <input
                  type="date"
                  value={archiveDetails.deceasedDate || ""}
                  onChange={(e) =>
                    setArchiveDetails({
                      ...archiveDetails,
                      deceasedDate: e.target.value,
                    })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  required
                />
                {!archiveDetails.deceasedDate && (
                  <p className="text-xs text-red-500 mt-1">
                    Date of death is required for Deceased.
                  </p>
                )}
              </div>
            )}

            {/* If Other → Custom Reason Input */}
            {archiveDetails.reason === "Other" && (
              <input
                type="text"
                value={archiveDetails.otherReason || ""}
                onChange={(e) =>
                  setArchiveDetails({
                    ...archiveDetails,
                    otherReason: e.target.value,
                  })
                }
                className="w-full border rounded-md px-3 py-2 text-sm mt-3"
                placeholder="Enter custom reason"
                required
              />
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowArchiveModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                // ✅ Final reason
                const finalReason =
                  archiveDetails.reason === "Other"
                    ? archiveDetails.otherReason
                    : archiveDetails.reason;

                // ✅ Require date if Deceased
                if (
                  archiveDetails.reason === "Deceased" &&
                  !archiveDetails.deceasedDate
                ) {
                  return;
                }

                if (!finalReason?.trim()) return;

                setArchiving(true);
                try {
                  await axios.put(
                    `${backendUrl}/api/senior-citizens/archive/${selectedArchiveCitizen.id}`,
                    {
                      reason: finalReason,
                      deceasedDate:
                        archiveDetails.reason === "Deceased"
                          ? archiveDetails.deceasedDate
                          : null,
                    },
                    { withCredentials: true }
                  );
                  await fetchCitizens();
                  setShowArchiveModal(false);
                  setArchiveDetails({
                    reason: "",
                    otherReason: "",
                    deceasedDate: "",
                  });
                  setShowSuccessModal(true);
                } catch (err) {
                  console.error("Archive failed", err);
                  setError(
                    "Failed to archive senior citizen. Please try again."
                  );
                } finally {
                  setArchiving(false);
                }
              }}
              disabled={
                archiving ||
                !archiveDetails.reason ||
                (archiveDetails.reason === "Other" &&
                  !archiveDetails.otherReason?.trim()) ||
                (archiveDetails.reason === "Deceased" &&
                  !archiveDetails.deceasedDate)
              }
            >
              {archiving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Archive"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Archive Success Modal */}
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
            Senior Citizen archived successfully!
          </p>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </div>
      </Modal>

      {/* Error Modal (optional) */}
      <Modal isOpen={!!error} onClose={() => setError("")} title="Error">
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Archive Failed
          </h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button variant="primary" onClick={() => setError("")}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SeniorCitizenList;
