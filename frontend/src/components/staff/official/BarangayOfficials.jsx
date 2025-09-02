// BarangayOfficials.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Button from "../../UI/Button";
import BarangayCard from "./BarangayCard";
import StatusMessage from "../../officials/StatusMessage";
import { PlusIcon, Loader2 } from "lucide-react";

const BarangayOfficials = ({ title }) => {
  const [barangays, setBarangays] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "",
    id: null,
    payload: null,
  });
  const [formData, setFormData] = useState({
    barangay: "",
    president: "",
    position: "",
    existingImage: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [crudLoading, setCrudLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showCropper, setShowCropper] = useState(false);
  const [rawImage, setRawImage] = useState(null);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const fetchBarangays = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await axios.get(`${backendUrl}/api/officials/barangay`, {
        withCredentials: true,
      });
      setBarangays(response.data);
    } catch (err) {
      console.error("Error fetching barangay officials:", err);
      setError(
        err.response?.data?.message || "Failed to load barangay officials."
      );
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchBarangays();
  }, [fetchBarangays]);

  return (
    <div className="">
      {isLoading || crudLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          <p className="ml-3 text-gray-600">
            {isLoading ? "Loading officials..." : "Processing request..."}
          </p>
        </div>
      ) : (
        <>
          <StatusMessage type="error" message={error} />
          <StatusMessage type="success" message={successMessage} />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 place-items-center">
            {barangays.length === 0 ? (
              <p className="col-span-full text-center text-gray-600 py-4">
                No barangay officials found.
              </p>
            ) : (
              barangays.map((b) => <BarangayCard key={b.id} official={b} />)
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BarangayOfficials;
