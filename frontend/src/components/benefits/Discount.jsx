import React, { useState, useEffect } from "react";
import { PercentIcon, CheckCircle } from "lucide-react";
import BenefitsCard from "../UI/BenefitsCard";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import axios from "axios";

const Discount = ({ onEdit }) => {
  const [discounts, setDiscounts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${backendUrl}/api/benefits/discount`);
      setDiscounts(response.data);
    } catch (error) {
      console.error("Failed to fetch Discounts: ", error);
      setError(error.message || "Failed to fetch discounts");
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setSelectedId(id);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${backendUrl}/api/benefits/${selectedId}`, {
        withCredentials: true,
      });
      setDiscounts((prev) => prev.filter((item) => item.id !== selectedId));
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error deleting benefits:", err);
      alert("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-lg font-medium mb-4 text-gray-800 flex items-center gap-2">
        <PercentIcon className="w-6 h-6 text-blue-600" />
        Senior Citizen Discounts in San Jose, Occidental Mindoro
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">Loading discounts...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-red-500">{error}</p>
        </div>
      ) : discounts.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">No discounts available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {discounts.map((item) => (
            <BenefitsCard
              key={item.id}
              type={item}
              icon={<PercentIcon className="w-5 h-5 text-blue-500" />}
              textColor="text-blue-700"
              textIcon="text-blue-500"
              onDelete={confirmDelete}
              onEdit={onEdit}
            />
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

export default Discount;
