import React, { memo } from "react";
import Button from "../UI/Button";
import { UploadCloud, Loader2 } from "lucide-react";

const AddEvent = memo(
  ({ newEvent, onInputChange, onImageChange, onSubmit, loading }) => {
    return (
      <div
        className={`space-y-4 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={newEvent.title}
            onChange={onInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={newEvent.description}
            onChange={onInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows="3"
            disabled={loading}
          ></textarea>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={newEvent.date}
            onChange={onInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={loading}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Image
          </label>

          {/* Show upload area only if no preview */}
          {!newEvent.preview && (
            <label
              className={`mt-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <UploadCloud className="h-6 w-6 text-gray-500 mb-1" />
              <span className="text-sm text-gray-600">
                Click to select an image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
                disabled={loading}
              />
            </label>
          )}

          {/* Image preview */}
          {newEvent.preview && (
            <div className="mt-3 relative">
              <img
                src={newEvent.preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  onClick={() =>
                    document.getElementById("event-image-input")?.click()
                  }
                  variant="secondary"
                  className="px-4 py-1 text-sm"
                  disabled={loading}
                >
                  Change Image
                </Button>
              </div>
              {/* Hidden input for changing image */}
              <input
                type="file"
                id="event-image-input"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
                disabled={loading}
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={onSubmit}
            variant="primary"
            icon={
              loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4 mr-2" />
              )
            }
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Event"}
          </Button>
        </div>
      </div>
    );
  }
);

export default AddEvent;
