import React, { useState, useEffect } from "react";
import Button from "../../UI/Button";
import Modal from "../../UI/Modal";
import { Loader2, SaveIcon, XCircle, ImagePlus } from "lucide-react";
import user from "../../../assets/user.png";
import axios from "axios";

const BarangayForm = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  handleFileChange,
  existingImage,
  error,
  loading,
  editingId,
  backendUrl,
}) => {
  const [barangayOptions, setBarangayOptions] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const fetchBarangays = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/barangays/All`);
      const options = res.data.map((b) => b.barangay_name); // or b.name depending on your DB
      setBarangayOptions(options);
    } catch (err) {
      console.error("Failed to fetch barangays:", err);
    }
  };

  useEffect(() => {
    fetchBarangays();
  }, []);

  useEffect(() => {
    let previewUrl;

    if (formData.imageFile instanceof File) {
      previewUrl = URL.createObjectURL(formData.imageFile);
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [formData.imageFile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editingId
          ? "Edit Barangay Association Official"
          : "Add Barangay Association Official"
      }
    >
      <div className="p-6">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="flex justify-center">
            <div className="relative group w-24 h-24 sm:w-32 sm:h-32">
              <img
                src={
                  formData.imageFile instanceof File
                    ? URL.createObjectURL(formData.imageFile)
                    : existingImage || user
                }
                alt="Profile Preview"
                className="w-full h-full object-cover rounded-xl border-4 border-blue-200 group-hover:border-blue-400 transition-all duration-300 shadow"
              />
              <label
                htmlFor="image"
                className="absolute bottom-0.5 right-0.5 bg-blue-600 text-white rounded-xl p-2 sm:p-1.5 cursor-pointer 
                 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 
                 transition-all duration-300 transform translate-y-0 sm:translate-y-1 sm:group-hover:translate-y-0 
                 shadow-lg hover:bg-blue-700"
                title="Change Image"
              >
                <ImagePlus className="text-white w-5 h-5 sm:w-4 sm:h-4" />
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="president"
              className="block text-sm font-medium text-gray-700"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="president"
              name="president"
              value={formData.president}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label
              htmlFor="position"
              className="block text-sm font-medium text-gray-700"
            >
              Position <span className="text-red-500">*</span>
            </label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md px-3 py-2"
              required
            >
              <option value="">Select Position</option>
              <option value="President">President</option>
            </select>
          </div>

          {(validationError || error) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              <span>{validationError || error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={
                loading ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <SaveIcon className="h-4 w-4 mr-2" />
                )
              }
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Barangay Association Presidents"
                : "Add Barangay Association Presidents"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BarangayForm;
