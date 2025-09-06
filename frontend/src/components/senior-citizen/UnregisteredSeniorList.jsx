import React, { useState, useEffect } from "react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import Pagination from "../UI/Component/Pagination";
import axios from "axios";

const UnregisteredSeniorList = ({ onView, onRegister }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [seniorCitizens, setSeniorCitizens] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const fetchUnregisteredCitizens = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${backendUrl}/api/senior-citizens/unregistered?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );

      const { citizens, total, totalPages } = response.data;

      setSeniorCitizens(citizens || []);
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
    fetchUnregisteredCitizens();
  }, [page]);

  return (
    <div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Age", "Gender", "Address"].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
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
                      {`${citizen.form_data?.street || ""}, Brgy. ${
                        citizen.form_data?.barangay || ""
                      }, ${citizen.form_data?.municipality || ""}, ${
                        citizen.form_data?.province || ""
                      }`}
                    </td>
                    <td className="px-6 py-4 text-sm font-xs">
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          onClick={() => onView(citizen.id)}
                        >
                          View
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => onRegister(citizen.id)}
                        >
                          Register
                        </Button>
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
                    {loading
                      ? "Loading unregistered senior citizens..."
                      : error || "No unregistered senior citizens found."}
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
    </div>
  );
};

export default UnregisteredSeniorList;
