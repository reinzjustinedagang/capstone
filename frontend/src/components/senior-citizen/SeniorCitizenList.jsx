import React, { useState, useMemo, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Button from "../UI/Button";
import Delete from "../UI/Button/Delete";
import SeniorCitizenForm from "./SeniorCitizenForm";
import Modal from "../UI/Modal"; // This will be your smaller modal (for notifications and delete confirmation)
import Modal2 from "../UI/Modal2"; // This is your larger modal for the form
import Pagination from "../UI/Component/Pagination";
import SearchAndFilterBar from "../UI/Component/SearchAndFilterBar";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowDown,
  ArrowUp,
  ArchiveRestore,
  Filter,
  CheckCircle,
  X,
} from "lucide-react";
import axios from "axios";
import AddSenior from "./AddSenior";

const SeniorCitizenList = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterBarangay, setFilterBarangay] = useState("All Barangays");
  const [filterHealthStatus, setFilterHealthStatus] =
    useState("All Health Status");
  const [filterAge, setFilterAge] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [barangayOptions, setBarangayOptions] = useState([]);
  const [sortBy, setSortBy] = useState("lastName"); // Match the default to one of your backend's allowedSort
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // To customize the text

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const [seniorCitizens, setSeniorCitizens] = useState([]);
  const [deletedCitizens, setDeletedCitizens] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [barangayMap, setBarangayMap] = useState({});

  // --- NEW STATE FOR NOTIFICATION MODAL ---
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success"); // 'success' or 'error'
  // ----------------------------------------

  const fetchCitizens = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        limit,
        search: searchTerm || "",
        barangay: filterBarangay || "All",
        gender: filterGender || "All",
        ageRange: filterAge || "All",
        healthStatus: filterHealthStatus || "All",
        sortBy: sortBy || "lastName",
        sortOrder: sortOrder || "asc",
      };

      const response = await axios.get(
        `${backendUrl}/api/senior-citizens/page`,
        {
          params,
          withCredentials: true,
        }
      );

      console.log("API Response Data (citizens):", response.data.citizens);

      // ✅ Ensure form_data is always an object
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
    } catch (err) {
      console.error("Failed to fetch senior citizen:", err);
      setError("Failed to load senior citizens. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (citizen) => {
    setSelectedCitizen(citizen);
    setShowEditModal(true);
  };

  const handleDelete = (citizen) => {
    setSelectedCitizen(citizen);
    setShowDeleteModal(true);
  };

  const handleFormSuccess = async (message) => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedCitizen(null);
    await fetchCitizens(); // Refetch data after successful submission

    // --- Show success notification ---
    setNotificationMessage(message || "Operation completed successfully!");
    setNotificationType("success");
    setShowNotificationModal(true);
    // ---------------------------------
  };

  const handleFormError = (message) => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedCitizen(null); // Close the form modal even on error

    // --- Show error notification ---
    setNotificationMessage(
      message || "An error occurred during the operation."
    );
    setNotificationType("error");
    setShowNotificationModal(true);
    // -------------------------------
  };

  const handleDeleteConfirm = async () => {
    console.log("Deleting ID:", selectedCitizen?.id);

    try {
      await axios.patch(
        `${backendUrl}/api/senior-citizens/soft-delete/${selectedCitizen.id}`,
        {},
        { withCredentials: true }
      );

      await fetchCitizens();
      setShowDeleteModal(false);
      setSelectedCitizen(null);

      // --- Show SUCCESS modal ---
      setSuccessMessage("Senior Citizen deleted successfully!");
      setShowSuccessModal(true);
      // ---------------------------
    } catch (err) {
      console.error("Failed to delete:", err);
      setError("Delete failed"); // Keep internal error state for now

      // --- Show error notification for delete ---
      setNotificationMessage("Failed to delete senior citizen record.");
      setNotificationType("error");
      setShowNotificationModal(true);
      // ----------------------------------------
    }
  };

  const fetchBarangays = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/barangays/all`);

      // Create mapping: { id: name }
      const map = {};
      response.data.forEach((b) => {
        map[b.id] = b.barangay_name;
      });
      setBarangayMap(map);

      // Optional: for filters dropdown
      const options = [
        "All Barangays",
        ...response.data.map((b) => b.barangay_name),
      ];
      setBarangayOptions(options);
    } catch (error) {
      console.error("Failed to fetch barangays:", error);
    }
  };

  const toggleSortOrder = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterBarangay("All Barangays");
    setFilterHealthStatus("All Health Status");
    setFilterAge("All");
    setFilterGender("All");
    setShowFilters(false);
  };

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

  // ✅ HOOK 1: Fetches the data for the current view
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
    backendUrl,
  ]);

  // ✅ HOOK 2: Resets to page 1 ONLY when filters change
  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    filterBarangay,
    filterHealthStatus,
    filterAge,
    filterGender,
    // Note: Do NOT include 'page' in this dependency array
  ]);

  // ✅ HOOK 3 (Recommended): Fetches barangays only once on component mount
  useEffect(() => {
    fetchBarangays();
  }, []);

  return (
    <div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { label: "Name", key: "lastName" },
                  { label: "Age", key: "age" }, // Backend provides 'age', so this is fine
                  { label: "Gender", key: "gender" },
                  { label: "Address", key: "barangay" }, // Backend allows sorting by 'barangay', so this is fine.
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
                  Health Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {seniorCitizens && seniorCitizens.length > 0 ? (
                seniorCitizens.map((citizen) => (
                  <tr key={citizen.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {`${citizen.lastName}, ${citizen.firstName} ${
                        citizen.middleName || ""
                      } ${citizen.suffix || ""}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {citizen.age}{" "}
                      {/* This is correct (from generated column) */}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {citizen.gender}{" "}
                      {/* This is correct (from generated column) */}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {`${citizen.form_data?.street || ""}, Brgy. ${
                        // Use barangayMap for new records; fallback to form_data for old records
                        citizen.barangay_id
                          ? barangayMap[citizen.barangay_id] || "Unknown"
                          : citizen.form_data?.barangay || ""
                      }, ${citizen.form_data?.municipality || ""}, ${
                        citizen.form_data?.province || ""
                      }`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {/* ✅ FIX: Access from citizen.form_data */}
                      {citizen.form_data?.mobileNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-md ${
                          /* ✅ FIX: Access from citizen.form_data */
                          citizen.form_data?.healthStatus === "Good"
                            ? "bg-green-100 text-green-800"
                            : citizen.form_data?.healthStatus ===
                              "With Maintenance Meds"
                            ? "bg-blue-100 text-blue-800"
                            : citizen.form_data?.healthStatus ===
                              "Needs Medical Attention"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {/* ✅ FIX: Access from citizen.form_data */}
                        {citizen.form_data?.healthStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-xs">
                      {/* ... your actions buttons are fine ... */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(citizen)}
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
                    {loading
                      ? "Loading senior citizens..."
                      : "No senior citizens found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          limit={limit}
          totalCount={totalCount}
          setPage={setPage}
        />
      </div>

      {/* Add/Edit Modal (combined) */}
      <Modal2
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setSelectedCitizen(null);
        }}
        title={
          showAddModal
            ? "Register New Senior Citizen"
            : "Edit Senior Citizen Record"
        }
      >
        {/* <SeniorCitizenForm
          citizen={selectedCitizen}
          onSubmitSuccess={handleFormSuccess} // Pass success handler
          onSubmitError={handleFormError} // Pass error handler
          onCancel={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedCitizen(null);
          }}
        /> */}
        <AddSenior
          onSubmitSuccess={handleFormSuccess} // Pass success handler
          onSubmitError={handleFormError} // Pass error handler
          onCancel={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedCitizen(null);
          }}
        />
      </Modal2>

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
        />
      </Modal>

      {/* --- NEW: Notification Modal --- */}
      <Modal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        title={"Confirm Update"}
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
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-500" />
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

export default SeniorCitizenList;
