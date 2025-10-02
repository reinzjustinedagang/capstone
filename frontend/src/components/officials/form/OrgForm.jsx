import React, { useEffect, useState } from "react";
import Button from "../../UI/Button"; // Importing your Button component
import {
  Loader2,
  SaveIcon,
  XCircle,
  ImagePlus,
  UserIcon,
  CheckCircle,
} from "lucide-react"; // Importing necessary icons
import user from "../../../assets/user.png";
import axios from "axios";

const OrgForm = ({
  formData,
  onChange,
  onFileChange,
  onSubmit, // This is the submit handler passed from parent
  onCancel, // This prop is used for the Cancel button's onClick
  error, // To display validation/API errors within the form
  isLoading, // Indicates if a save/update operation is in progress (crudLoading from parent)
  isEditing, // Boolean to tell if the form is in edit mode
  existingImage, // The filename of the existing image if in edit mode
  backendUrl, // Backend URL for constructing the image source
  onApprove,
  positionIdBeingEdited, // ID of the position being edited (for approval)
}) => {
  const [position, setPosition] = useState([]);

  const fetchPositions = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/position/orgchart`);
      setPosition(res.data);
    } catch (error) {
      console.error("Failed to fetch organizational position settings:", error);
    }
  };

  useEffect(() => {
    fetchPositions();
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      {/* Image and Preview Section */}
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
            onClick={() => {
              const imageSrc =
                formData.imageFile instanceof File
                  ? URL.createObjectURL(formData.imageFile)
                  : existingImage || user;
              window.open(imageSrc, "_blank");
            }}
          />

          {/* Change Icon */}
          <label
            htmlFor="image"
            className="absolute bottom-0.5 right-0.5 bg-blue-600 text-white rounded-xl 
                 p-2 sm:p-1.5 cursor-pointer 
                 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 
                 transition-all duration-300 transform translate-y-0 sm:translate-y-1 sm:group-hover:translate-y-0 
                 shadow-lg hover:bg-blue-700"
            title="Change Image"
          >
            <ImagePlus className="text-white w-5 h-5 sm:w-4 sm:h-4" />
          </label>

          {/* Hidden File Input */}
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Official Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Enter name"
          value={formData.name}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="position"
          className="block text-sm font-medium text-gray-700"
        >
          Position
        </label>

        <select
          id="position"
          name="position"
          value={formData.position}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        >
          <option value="">Select Position</option>
          {Array.isArray(position) &&
            position.map((pos) => (
              <option key={pos.id} value={pos.name}>
                {pos.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700"
        >
          Hierarchy
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        >
          <option value="">Select hierarchy</option>
          <option value="top">Top</option>
          <option value="mid">Middle</option>
          <option value="bottom">Bottom</option>
        </select>
      </div>

      {/* Error display */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center"
          role="alert"
        >
          <XCircle className="h-5 w-5 mr-2" />
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          icon={<XCircle className="h-4 w-4" />}
        >
          Cancel
        </Button>

        {isEditing && formData.approved === 0 ? (
          <Button
            type="button"
            variant="primary"
            onClick={() => onApprove(positionIdBeingEdited)} // ✅ needs to be passed down
            disabled={isLoading}
            icon={
              isLoading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )
            }
          >
            {isLoading ? "Approving..." : "Approve"}
          </Button>
        ) : (
          <Button
            type="submit"
            variant="primary"
            icon={
              isLoading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <SaveIcon className="h-4 w-4 mr-2" />
              )
            }
            disabled={isLoading}
          >
            {isLoading
              ? "Saving..."
              : isEditing
              ? "Update Officer in Organization Chart"
              : "Add Officer in Organization Chart"}
          </Button>
        )}
      </div>
    </form>
  );
};

export default OrgForm;
