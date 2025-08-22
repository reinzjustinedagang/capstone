import React, { useState, useEffect } from "react";
import RepublicActCard from "./RepublicActCard";
import { BookOpenTextIcon, CheckCircle } from "lucide-react";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import axios from "axios";

const RepublicActs = ({ onEdit }) => {
  const [acts, setActs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Use one state for the confirmation modal
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Use one state for the success modal
  const [selectedId, setSelectedId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false); // New state for edit modal

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    fetchRepublicActs();
  }, []);

  const fetchRepublicActs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${backendUrl}/api/benefits/republic-acts`
      );
      setActs(response.data);
    } catch (error) {
      console.error("Failed to fetch Republic Acts: ", error);
      setError(error.message || "Failed to fetch republic acts");
      setActs([]);
    } finally {
      setLoading(false);
    }
  };

  // This function now correctly sets the confirm modal state
  const confirmDelete = (id) => {
    setSelectedId(id);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    try {
      setLoading(true); // Set loading to true while deleting
      await axios.delete(`${backendUrl}/api/benefits/${selectedId}`, {
        withCredentials: true,
      });
      setActs((prev) => prev.filter((law) => law.id !== selectedId));
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error deleting law:", err);
      alert("Failed to delete law");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const confirmEdit = (id) => {
    setSelectedId(id);
    setShowEditModal(true);
    console.log("Editing law with ID:", id);
  };

  return (
    <>
      <h1 className="text-lg font-medium mb-4 text-gray-800 flex items-center gap-2">
        <BookOpenTextIcon className="w-6 h-6 text-purple-600" />
        Republic Acts for Senior Citizens
      </h1>

      {loading && !acts.length ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">Loading Republic Acts...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-red-500">{error}</p>
        </div>
      ) : acts.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">
            No Republic Acts available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {acts.map((law) => (
            <div key={law.id}>
              <RepublicActCard
                law={law}
                onDelete={confirmDelete}
                onEdit={onEdit}
              />
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmModal && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => !loading && setShowConfirmModal(false)}
          title="Confirm Delete"
        >
          <div className="p-6">
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete this?
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={loading}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title=""
        >
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Delete</h3>
            <p className="text-sm text-gray-600 mb-4">Deleted Successfully!</p>
            <Button
              variant="primary"
              onClick={() => setShowSuccessModal(false)}
            >
              OK
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default RepublicActs;
