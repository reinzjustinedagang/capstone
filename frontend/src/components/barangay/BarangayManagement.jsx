import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  Loader2, // Added Loader2 for loading state
  XCircle, // Added XCircle for error state
} from "lucide-react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import axios from "axios";
import BarangayForm from "./BarangayForm";

const BarangayManagement = () => {
  const [barangays, setBarangays] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("barangay_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Number of records per page
  const [total, setTotal] = useState(0); // Renamed from totalCount for consistency with backend

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const fetchBarangays = async () => {
    try {
      setLoading(true);
      setError(""); // Clear previous errors
      const res = await axios.get(
        `${backendUrl}/api/barangays?page=${page}&limit=${limit}`
      );
      setBarangays(res.data.barangays); // Assuming backend sends { barangays: [...], total: N }
      setTotal(res.data.total); // Set total count from backend response
    } catch (err) {
      console.error("Failed to fetch barangays:", err);
      setError(err.response?.data?.message || "Failed to fetch barangays.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarangays();
  }, [page, limit, backendUrl]); // Depend on page, limit, and backendUrl

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true); // Indicate loading for the delete operation
      setError("");
      await axios.delete(`${backendUrl}/api/barangays/${selectedBarangay.id}`, {
        withCredentials: true,
      });
      setSelectedBarangay(null);
      setShowDeleteModal(false);
      // After deletion, re-fetch data. If current page is empty, go to previous page
      if (barangays.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchBarangays();
      }
    } catch (err) {
      console.error("Failed to delete barangay:", err);
      setError(err.response?.data?.message || "Failed to delete barangay.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSortOrder = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  // Memoized filtered and sorted barangays for display on the current page
  // The sorting is applied to the *current page's* data, not the whole dataset
  // as pagination handles the fetching of limited data.
  const displayedBarangays = barangays
    .filter((b) =>
      b.barangay_name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(total / limit);

  // Pagination button rendering logic copied from MessageHistory
  const renderPageButtons = () => {
    const pages = [];
    const maxPageButtons = 5; // Total number of page buttons to display

    if (totalPages > 0) {
      pages.push(1);
    }

    let startPage = Math.max(2, page - Math.floor((maxPageButtons - 3) / 2));
    let endPage = Math.min(
      totalPages - 1,
      page + Math.ceil((maxPageButtons - 3) / 2)
    );

    if (
      page <= Math.floor(maxPageButtons / 2) + 1 &&
      totalPages > maxPageButtons
    ) {
      endPage = maxPageButtons - 1;
    } else if (
      page >= totalPages - Math.floor(maxPageButtons / 2) &&
      totalPages > maxPageButtons
    ) {
      startPage = totalPages - (maxPageButtons - 2);
    }

    if (startPage > 2) {
      pages.push("ellipsis-start");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push("ellipsis-end");
    }

    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    const uniquePages = Array.from(new Set(pages)).sort((a, b) => {
      if (typeof a === "string") return 1;
      if (typeof b === "string") return -1;
      return a - b;
    });

    return uniquePages.map((p, index) => {
      if (typeof p === "string" && p.startsWith("ellipsis")) {
        return (
          <span
            key={`ellipsis-${p}-${index}`}
            className="px-2 py-2 text-gray-500 text-sm select-none"
          >
            ...
          </span>
        );
      }

      const isCurrentPage = page === p;
      let buttonClasses = `relative inline-flex items-center px-4 py-2 border text-sm font-medium
            ${
              isCurrentPage
                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }
            transition-colors duration-150 ease-in-out`;

      return (
        <button key={p} onClick={() => setPage(p)} className={buttonClasses}>
          {p}
        </button>
      );
    });
  };

  return (
    <>
      <div className="flex justify-end items-center mb-4">
        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          icon={<Plus className="h-4 w-4 mr-2" />}
        >
          Add New Barangay
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search barangays..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {error && (
          <div className="p-4 text-red-700 bg-red-100 border-l-4 border-red-500 flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            <p className="font-bold">Error:</p>
            <p className="ml-1">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="p-6 text-center text-gray-500 flex justify-center items-center">
            <Loader2 className="animate-spin h-6 w-6 mr-3 text-blue-500" />
            Loading barangays...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSortOrder("barangay_name")}
                  >
                    <div className="flex items-center">
                      Name
                      {sortBy === "barangay_name" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedBarangays.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No barangays found.
                    </td>
                  </tr>
                ) : (
                  displayedBarangays.map((barangay) => (
                    <tr key={barangay.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {barangay.barangay_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(barangay.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedBarangay(barangay);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBarangay(barangay);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-b-xl">
            {/* Mobile Pagination */}
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
            {/* Desktop Pagination */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * limit, total)}
                </span>{" "}
                of <span className="font-medium">{total}</span> results
              </p>

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
        )}
      </div>

      {/* Modals (Assuming Modal and BarangayForm are separate components) */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Barangay"
      >
        <BarangayForm
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchBarangays();
            setShowAddModal(false);
          }}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Barangay"
      >
        <BarangayForm
          barangay={selectedBarangay}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            fetchBarangays();
            setShowEditModal(false);
          }}
        />
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
      >
        <div className="p-6 text-center">
          <p className="mb-4 text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-red-600">
              {selectedBarangay?.barangay_name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BarangayManagement;
