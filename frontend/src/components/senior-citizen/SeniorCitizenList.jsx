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
} from "lucide-react";

const SeniorCitizenList = ({ onEdit }) => {
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
  const [filterHealthStatus, setFilterHealthStatus] =
    useState("All Health Status");
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
    setFilterHealthStatus("All Health Status");
    setFilterAge("All");
    setFilterGender("All");
    setShowFilters(false);
  };

  // Options
  const healthStatusOptions = [
    "All Health Status",
    "Good",
    "With Maintenance Meds",
    "Needs Medical Attention",
    "Bedridden",
  ];
  const genderOptions = ["All", "Male", "Female"];
  const AgeOptions = [
    "All",
    "60 - 69",
    "70 - 79",
    "80 - 89",
    "90 - 99",
    "100 - 100+",
  ];

  // Effects
  useEffect(() => {
    fetchCitizens();
  }, [
    page,
    searchTerm,
    filterBarangay,
    filterHealthStatus,
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
          clearFilters={clearFilters}
          AgeOptions={AgeOptions}
          genderOptions={genderOptions}
          barangayOptions={barangayOptions}
          healthStatusOptions={healthStatusOptions}
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
                      {`${citizen.form_data?.street || ""}, Brgy. ${
                        citizen.barangay_id
                          ? barangayMap[citizen.barangay_id] || "Unknown"
                          : citizen.form_data?.barangay || ""
                      }, ${citizen.form_data?.municipality || ""}, ${
                        citizen.form_data?.province || ""
                      }`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {citizen.form_data?.mobileNumber}
                    </td>
                    <td className="px-6 py-4">{citizen.form_data?.remarks}</td>
                    <td className="px-6 py-4 text-sm font-xs">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(citizen.id)}
                          className="text-blue-600 hover:text-blue-900"
                          aria-label={`Edit ${citizen.firstName} ${citizen.lastName}`}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(citizen)}
                          className="text-red-600 hover:text-red-900"
                          aria-label={`Delete ${citizen.firstName} ${citizen.lastName}`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>

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
                              <ArrowUp className="w-5 h-5 text-gray-600" />
                            ) : (
                              <MoreVertical className="w-5 h-5 text-gray-600" />
                            )}
                          </button>

                          {openDropdownId === citizen.id && (
                            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 transition ease-in-out">
                              <button
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleMarkDeceased(citizen);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Archive
                              </button>

                              <button
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleForReports(citizen);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                              >
                                Generate ID
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
    </div>
  );
};

export default SeniorCitizenList;
