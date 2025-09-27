// BarangayOfficials.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import BarangayCard from "./card/BarangayCard";
import { PlusIcon, Loader2 } from "lucide-react";

const BarangayOfficials = ({ title }) => {
  const [barangays, setBarangays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAll, setShowAll] = useState(false); // ✅ control for See More

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const fetchBarangays = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await axios.get(
        `${backendUrl}/api/officials/barangay-public`,
        {
          withCredentials: true,
        }
      );
      setBarangays(response.data);
    } catch (err) {
      console.error("Error fetching barangay officials:", err);
      setError(
        err.response?.data?.message || "Failed to load barangay officials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBarangays();
  }, []);

  // ✅ Limit display to first 12 officials unless showAll is true
  const officialsToShow = showAll ? barangays : barangays.slice(0, 5);

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          <p className="ml-3 text-gray-600">
            {isLoading ? "Loading officials..." : "Processing request..."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 place-items-center">
            {barangays.length === 0 ? (
              <p className="col-span-full text-center text-gray-600 py-4">
                No barangay officials found.
              </p>
            ) : (
              officialsToShow.map((b) => (
                <BarangayCard
                  key={b.id}
                  official={b}
                  onEdit={() => {
                    setFormData({
                      barangay: b.barangay_name,
                      president: b.president_name,
                      position: b.position,
                      existingImage: b.image,
                    });
                    setImageFile(null);
                    setEditingId(b.id);
                    setShowFormModal(true);
                  }}
                  onDelete={() => openDeleteConfirmation(b.id)}
                />
              ))
            )}
          </div>

          {/* ✅ See More button */}
          {barangays.length > 5 && !showAll && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowAll(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
              >
                See More
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default BarangayOfficials;
