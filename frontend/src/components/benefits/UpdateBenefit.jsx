import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Building,
  Edit,
  Tags,
  Info,
  SaveIcon,
  Text,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import axios from "axios";

// This is the main component for updating a benefit.
// It fetches existing data, allows the user to edit it, and handles the API call to update the record.
const UpdateBenefit = ({ benefitId, onSuccess }) => {
  // State for form data, initialized with empty strings
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    location: "",
    provider: "",
    enacted_date: "",
  });

  // UI states
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Backend URL from environment variables
  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // useEffect to fetch existing benefit details when the component loads
  useEffect(() => {
    // Check if a benefitId is provided before fetching
    if (benefitId) {
      const fetchBenefit = async () => {
        try {
          // Send a GET request to the backend to get the benefit data
          const res = await axios.get(
            `${backendUrl}/api/benefits/${benefitId}`
          );
          setFormData(res.data);
        } catch (error) {
          console.error("Failed to fetch benefit details:", error);
          setMessage("Failed to load benefit details.");
        } finally {
          setLoading(false);
        }
      };
      fetchBenefit();
    }
  }, [benefitId, backendUrl]); // Dependency array ensures this runs when benefitId or backendUrl changes

  // Handler for input changes to update the form state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handler for the actual update API call, triggered by the modal button
  const handleUpdate = async () => {
    setMessage(""); // Clear any previous messages
    setShowConfirmModal(false); // Close the confirmation modal

    if (!formData.type) {
      setMessage("Please select a type before updating the benefit.");
      return;
    }

    setSaving(true);

    try {
      // Send a PUT request to update the benefit with the form data
      await axios.put(`${backendUrl}/api/benefits/${benefitId}`, formData, {
        withCredentials: true,
      });

      if (onSuccess) onSuccess(); // Refresh parent list
    } catch (error) {
      console.error("Failed to update benefit:", error);
      setMessage("Failed to update benefit.");
    } finally {
      setSaving(false);
    }
  };

  // Render a loading state while fetching data
  if (loading) {
    return (
      <p className="text-gray-500 text-center">Loading benefit details...</p>
    );
  }

  // Dynamically set form fields based on the selected benefit type
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
        <Edit className="w-6 h-6 text-indigo-600" /> Update Benefit
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
          e.preventDefault(); // Prevent default form submission
          setShowConfirmModal(true); // Show confirmation modal
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
                  value={formData.title ?? ""}
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
                    value={formData[field.name] ?? ""}
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
                value={formData.description ?? ""}
                onChange={handleChange}
                required
                rows={5}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <Text className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

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
            {saving ? "Updating..." : "Update Benefit"}
          </Button>
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Update"
        >
          <div className="mt-4 text-sm text-gray-700">
            Are you sure you want to update this benefit?
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
              onClick={handleUpdate}
              className={`px-4 py-2 rounded text-sm ${
                saving
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {saving ? "Updating..." : "Yes, Update"}
            </button>
          </div>
        </Modal>
      </form>
    </div>
  );
};

export default UpdateBenefit;
