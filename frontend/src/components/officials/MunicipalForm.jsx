import React, { useEffect } from "react";
import Button from "../UI/Button"; // Importing your Button component
import {
  Loader2,
  SaveIcon,
  XCircle,
  UploadCloud,
  UserIcon,
} from "lucide-react"; // Importing necessary icons
import user from "../../assets/user.png";

const MunicipalForm = ({
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
}) => {
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
      {/* Image  and Preview Section */}
      <div className="flex justify-center">
        <div className="relative group w-32 h-32">
          <img
            src={
              formData.imageFile instanceof File
                ? URL.createObjectURL(formData.imageFile)
                : existingImage || user
            }
            alt="Profile Preview"
            className="w-full h-full object-cover rounded-full border-4 border-blue-200 group-hover:border-blue-400 transition-all duration-300 shadow"
          />

          <label
            htmlFor="image"
            className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 shadow-lg hover:bg-blue-700"
            title="Change Image"
          >
            <UploadCloud className="w-4 h-4" />
          </label>
        </div>

        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
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
          <option value="President">President</option>
          <option value="Vice President">Vice President</option>
          <option value="Secretary">Secretary</option>
          <option value="Assistant Secretary">Assistant Secretary</option>
          <option value="Treasurer">Treasurer</option>
          <option value="Assistant Treasurer">Assistant Treasurer</option>
          <option value="Auditor">Auditor</option>
          <option value="Public Relations Officer">
            Public Relations Officer
          </option>
          <option value="PIO">Public Information Officer</option>
          <option value="Sgt-at-Arms">Sgt-at-Arms</option>
          <option value="Council Members">Council Members</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700"
        >
          Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        >
          <option value="">Select type</option>
          <option value="head">Head</option>
          <option value="vice">Vice</option>
          <option value="officer">Officer</option>
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
        {/* Cancel Button */}
        <Button
          type="button" // Important: set type to "button" to prevent form submission
          variant="secondary"
          onClick={onCancel} // Calls the onCancel prop passed from the parent
          disabled={isLoading} // Disable while loading/saving
          icon={<XCircle className="h-4 w-4" />} // Icon for cancel
        >
          Cancel
        </Button>
        {/* Save/Update Button */}
        <Button
          type="submit" // This button will submit the form
          variant="primary"
          icon={
            isLoading ? ( // Show Loader2 icon when isLoading is true
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              // Show SaveIcon when not loading
              <SaveIcon className="h-4 w-4 mr-2" />
            )
          }
          disabled={isLoading} // Disable while loading/saving
        >
          {isLoading
            ? "Saving..." // Text when loading
            : isEditing
            ? "Update Municipal Federation Officer" // Text when editing
            : "Add Municipal Federation Officer "}{" "}
          {/* Text when adding new */}
        </Button>
      </div>
    </form>
  );
};

export default MunicipalForm;
