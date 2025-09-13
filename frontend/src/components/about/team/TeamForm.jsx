import React, { useEffect, useState } from "react";
import Modal from "../../UI/Modal";
import Button from "../../UI/Button";
import { Loader2, SaveIcon, ImagePlus, XCircle } from "lucide-react";
import user from "../../../assets/user.png";

const TeamForm = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  handleFileChange,
  existingImage,
  error,
  loading,
  editingIndex,
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (formData.imageFile instanceof File) {
      const url = URL.createObjectURL(formData.imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [formData.imageFile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingIndex !== null ? "Edit Team Member" : "Add Team Member"}
    >
      <div className="p-6">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {/* Image */}
          <div className="flex justify-center">
            <div className="relative group w-24 h-24 sm:w-32 sm:h-32">
              <img
                src={previewUrl ? previewUrl : existingImage || user}
                alt="Profile Preview"
                className="w-full h-full object-cover rounded-full border-4 border-blue-200 shadow"
              />
              <label
                htmlFor="image"
                className="absolute bottom-0.5 right-0.5 bg-blue-600 text-white rounded-xl p-2 cursor-pointer
                 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 
                 transition-all duration-300 shadow-lg hover:bg-blue-700"
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

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
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
                : editingIndex !== null
                ? "Update Team Member"
                : "Add Team Member"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TeamForm;
