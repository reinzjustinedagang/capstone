import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import {
  Info,
  Building,
  SaveIcon,
  Text,
  MapPin,
  Tags,
  XCircle,
  PlusCircle,
  Loader2,
  CheckCircle,
  Calendar,
} from "lucide-react";

const AddBenefit = () => {
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    location: "",
    provider: "",
    enacted_date: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // This function now correctly handles the submission logic
  const handleFinalSubmit = async () => {
    setMessage(""); // clear any previous messages

    if (!formData.type || !formData.title) {
      setMessage("Please select a type and title before adding a benefit.");
      return; // stop here
    }

    setShowConfirmModal(false); // Close the confirmation modal
    setSaving(true);
    try {
      await axios.post(`${backendUrl}/api/benefits/`, formData, {
        withCredentials: true,
      });
      // Clear form
      setFormData({
        type: "",
        title: "",
        description: "",
        location: "",
        provider: "",
        enacted_date: "",
      });

      // Show success modal
      setMessage("Benefit added successfully.");
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      setMessage("Failed to add benefit."); // Keep red alert for errors
    } finally {
      setSaving(false);
    }
  };

  // Dynamic fields based on type
  const typeFields =
    formData.type === "republic acts"
      ? [
          {
            name: "enacted_date",
            label: "Enacted Date",
            type: "date",
            icon: (
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            ),
          },
        ]
      : [
          {
            name: "location",
            label: "Location",
            type: "text",
            icon: (
              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            ),
          },
          {
            name: "provider",
            label: "Provider",
            type: "text",
            icon: (
              <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            ),
          },
        ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <PlusCircle className="w-6 h-6 text-indigo-600" /> Add New Benefit
      </h1>

      {message && (
        <p
          className={`mb-4 ${
            message.includes("Failed")
              ? "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center"
              : "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center"
          }`}
        >
          {message}
        </p>
      )}

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirmModal(true);
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column: Type, Title, Dynamic Fields */}
          <div className="grid grid-cols-1 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <div className="mt-1 relative">
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">-- Select Type --</option>
                  <option value="discount">Discount</option>
                  <option value="financial assistance">
                    Financial Assistance
                  </option>
                  <option value="medical benefits">Medical Benefits</option>
                  <option value="privileges and perks">
                    Privileges and Perks
                  </option>
                  <option value="republic acts">Republic Acts</option>
                </select>
                <Tags className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <Info className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Dynamic Fields */}
            {typeFields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <div className="mt-1 relative">
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {field.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Right column: Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1 relative">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <Text className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            icon={
              saving ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <SaveIcon className="h-4 w-4 mr-2" />
              )
            }
            disabled={saving}
          >
            {saving ? "Adding..." : "Add Benefit"}
          </Button>
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Add"
        >
          <div className="mt-4 text-sm text-gray-700">
            Are you sure you want to add this benefit?
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              onClick={handleFinalSubmit} // Correctly call the new handler
              className={`px-4 py-2 rounded text-sm ${
                saving
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {saving ? "Saving..." : "Yes, Add"}
            </button>
          </div>
        </Modal>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title=""
        >
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Success</h3>
            <p className="text-sm text-gray-600 mb-4">
              The new Benefits Added successfully!
            </p>
            <Button
              variant="primary"
              onClick={() => setShowSuccessModal(false)}
            >
              OK
            </Button>
          </div>
        </Modal>
      </form>
    </div>
  );
};

export default AddBenefit;
