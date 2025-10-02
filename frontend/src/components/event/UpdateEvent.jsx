import { useState, useRef, useEffect } from "react";
import { SaveIcon, Loader2, ImagePlus, Edit2 } from "lucide-react";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import CropperModal from "../UI/CropperModal";
import axios from "axios";

const UpdateEvent = ({ eventId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "event",
    description: "",
    date: "",
  });

  const [eventData, setEventData] = useState(null); // fetched event
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [rawImage, setRawImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);

  const fileInputRef = useRef(null);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/events/${eventId}`, {
          withCredentials: true,
        });
        setEventData(res.data);
        setFormData({
          title: res.data.title || "",
          type: res.data.type || "event",
          description: res.data.description || "",
          date: res.data.date ? res.data.date.split("T")[0] : "",
        });
        setImagePreview(res.data.image_url || null);
      } catch (err) {
        console.error("Failed to load event:", err);
      }
    };

    if (eventId) fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert("Only JPG, JPEG, or PNG files are allowed.");
      return;
    }

    if (formData.type === "slideshow") {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      return;
    }

    setRawImage(URL.createObjectURL(file));
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedBlob) => {
    const fileName = `event_${Date.now()}.png`;
    const croppedFile = new File([croppedBlob], fileName, {
      type: "image/png",
    });

    setImageFile(croppedFile);
    setImagePreview(URL.createObjectURL(croppedFile));
    setShowCropper(false);
  };

  const handleSubmit = async () => {
    if (!eventData) return;
    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append("title", formData.title);
      formPayload.append("type", formData.type);
      formPayload.append("description", formData.description);
      formPayload.append("date", formData.date);

      if (imageFile) {
        formPayload.append("image", imageFile);
      } else {
        formPayload.append("image_url", eventData.image_url || "");
      }

      await axios.put(`${backendUrl}/api/events/${eventId}`, formPayload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to update event:", err);
      alert("Failed to update event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!eventData) return;
    setLoading(true);

    try {
      await axios.put(`${backendUrl}/api/events/${eventId}/approve`, null, {
        withCredentials: true,
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to approve event:", err);
      alert("Failed to approve event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <Edit2 className="w-6 h-6 text-indigo-600" /> Update Event
      </h1>

      {/* Image Preview */}
      <div>
        <label className="block text-sm font-medium">
          {formData.type === "event" ? "Event" : "Slideshow"} Image
        </label>
        <div className="flex items-center gap-4 mt-2">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Event Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            <option value="event">Event</option>
          </select>
        </div>

        {formData.type === "event" && (
          <>
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
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:outline-none"
                required
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
                required
              />
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>

        {eventData?.approved === 0 ? (
          <Button
            onClick={handleApprove}
            disabled={loading}
            icon={
              loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <SaveIcon className="w-4 h-4" />
              )
            }
          >
            {loading ? "Approving..." : "Approve"}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            icon={
              loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <SaveIcon className="w-4 h-4" />
              )
            }
          >
            {loading ? "Updating..." : "Update"}
          </Button>
        )}
      </div>

      {/* Cropper Modal */}
      {showCropper && rawImage && (
        <CropperModal
          imageSrc={rawImage}
          onClose={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
          aspect={formData.type === "slideshow" ? 16 / 9 : 1}
        />
      )}
    </div>
  );
};

export default UpdateEvent;
