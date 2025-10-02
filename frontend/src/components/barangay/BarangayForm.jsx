import React, { useEffect, useState } from "react";
import Button from "../UI/Button";
import axios from "axios";

const BarangayForm = ({ barangay, onClose, onSuccess }) => {
  const [name, setName] = useState(barangay?.barangay_name || "");
  const [controlNo, setControlNo] = useState(barangay?.controlNo || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (barangay) {
      setName(barangay.barangay_name);
      setControlNo(barangay.controlNo);
    }
  }, [barangay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // format control number to 3 digits (e.g., 1 -> "001")
      const formattedControlNo = controlNo.padStart(3, "0");

      if (barangay) {
        // Update existing
        await axios.put(
          `${backendUrl}/api/barangays/${barangay.id}`,
          { name, controlNo: formattedControlNo },
          { withCredentials: true }
        );
      } else {
        // Create new
        await axios.post(
          `${backendUrl}/api/barangays`,
          { name, controlNo: formattedControlNo },
          { withCredentials: true }
        );
      }

      onSuccess();
    } catch (err) {
      console.error("Failed to submit form:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred while saving the barangay."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border-l-4 border-red-500 rounded">
          {error}
        </div>
      )}

      {/* Barangay Name */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Barangay Name
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={3}
          disabled={loading}
          autoFocus
        />
      </div>

      {/* Control Number */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Control No.
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={controlNo}
          onChange={(e) => setControlNo(e.target.value)}
          required
          minLength={1}
          disabled={loading}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading
            ? barangay
              ? "Updating..."
              : "Saving..."
            : barangay
            ? "Update"
            : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default BarangayForm;
