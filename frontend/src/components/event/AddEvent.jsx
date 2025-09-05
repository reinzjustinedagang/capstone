import { useState, useRef } from "react";
import {
  SaveIcon,
  Loader2,
  CheckCircle,
  XCircle,
  ImagePlus,
  PlusCircle,
} from "lucide-react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import CropperModal from "../UI/CropperModal";
import axios from "axios";

const AddEvent = ({ onEventAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "event",
    description: "",
    date: "",
  });

  const [rawImage, setRawImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showCropper, setShowCropper] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fileInputRef = useRef(null);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError("Only JPG, JPEG, or PNG files are allowed.");
      return;
    }

    setError("");

    // 👉 If type is slideshow, skip cropper
    if (formData.type === "slideshow") {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      return;
    }

    // Otherwise, open cropper
    setRawImage(URL.createObjectURL(file));
    setShowCropper(true);
  };

  // Handle crop complete
  const handleCropComplete = async (croppedBlob) => {
    const fileName = `event_${Date.now()}.png`;
    const croppedFile = new File([croppedBlob], fileName, {
      type: "image/png",
    });

    setImageFile(croppedFile);
    setImagePreview(URL.createObjectURL(croppedFile));
    setShowCropper(false);
  };

  // Submit event
  const submitEvent = async () => {
    setLoading(true);
    setError("");
    try {
      const { title, type, description, date } = formData;

      if (!title || !type || !description || !date || !imageFile) {
        setError("All fields including image are required.");
        setLoading(false);
        return;
      }

      const formPayload = new FormData();
      formPayload.append("title", title);
      formPayload.append("type", type);
      formPayload.append("description", description);
      formPayload.append("date", date);
      formPayload.append("image", imageFile);

      await axios.post(`${backendUrl}/api/events/`, formPayload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMessage("Event added successfully!");
      setShowSuccessModal(true);
      setFormData({ title: "", type: "event", description: "", date: "" });
      setImageFile(null);
      setImagePreview(null);

      if (onEventAdded) onEventAdded();
    } catch (err) {
      console.error(err);
      setError("Failed to add event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setShowConfirmModal(true);
      }}
      className="space-y-6"
    >
      <h1 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <PlusCircle className="w-6 h-6 text-indigo-600" /> Add New Event
      </h1>
      {/* Event Image */}
      <div>
        <label className="block text-sm font-medium">
          {formData.type == "event" ? "Event" : "Slideshow"} Image
        </label>
        <div className="flex items-center gap-4 mt-2">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Event Preview"
              className={`object-cover border rounded 
          ${formData.type === "slideshow" ? "w-64 h-36" : "w-40 h-40"}`}
            />
          ) : (
            <div
              className={`flex items-center justify-center text-gray-400 border rounded 
          ${formData.type === "slideshow" ? "w-64 h-36" : "w-40 h-40"}`}
            >
              No Image
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="px-3 py-1 border rounded flex items-center gap-1 text-sm"
          >
            <ImagePlus size={16} /> {imagePreview ? "Change" : "Upload"}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Event Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">-- Select Type --</option>
            <option value="slideshow">Slideshow</option>
            <option value="event">Event</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:outline-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600">
          <XCircle size={18} /> {error}
        </div>
      )}
      {successMessage && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle size={18} /> {successMessage}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end items-center mt-6">
        <Button
          type="submit"
          disabled={loading}
          icon={
            loading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <SaveIcon />
            )
          }
        >
          {loading ? "Saving..." : "Add Event"}
        </Button>
      </div>

      {/* Cropper Modal */}
      {showCropper && rawImage && (
        <CropperModal
          imageSrc={rawImage}
          onClose={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
          aspect={formData.type === "slideshow" ? 16 / 9 : 1} // 👈 dynamic aspect
        />
      )}

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Add Event"
      >
        <div className="mt-4 text-sm text-gray-700">
          Are you sure you want to add this event?
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={() => {
              setShowConfirmModal(false);
              submitEvent();
            }}
            className={`px-4 py-2 rounded text-sm ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {loading ? "Adding..." : "Yes, Add"}
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
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Event Added Successfully
          </h3>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </form>
  );
};

export default AddEvent;
