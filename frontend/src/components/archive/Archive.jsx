import React, { useState, useEffect } from "react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import Pagination from "../UI/Component/Pagination";
import axios from "axios";
import { Loader2, Eye, ArchiveRestore } from "lucide-react";

const Archive = ({ onView }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [archivedCitizens, setArchivedCitizens] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [restoreTarget, setRestoreTarget] = useState(null);

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
    try {
      await axios.put(
        `${backendUrl}/api/senior-citizens/${restoreTarget.id}/restore-archive`,
        {},
        { withCredentials: true }
      );
      setRestoreTarget(null);
      fetchArchivedCitizens(); // refresh
    } catch (err) {
      console.error("Error restoring:", err);
      alert("Failed to restore citizen.");
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
                  "Details",
                  "Archived Date",
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
                      {citizen.barangay_id || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {citizen.gender || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-xs">
                      {citizen.details}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(citizen.deleted_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => setRestoreTarget(citizen)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <ArchiveRestore className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
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
          <Button variant="primary" onClick={handleRestore}>
            Restore
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Archive;
