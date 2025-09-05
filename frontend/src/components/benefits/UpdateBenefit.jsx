import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Building,
  Edit,
  Tags,
  Info,
  SaveIcon,
  Text,
  Loader2,
  ImagePlus,
} from "lucide-react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import CropperModal from "../UI/CropperModal";
import axios from "axios";

const UpdateBenefit = ({ benefitId, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    location: "",
    provider: "",
    enacted_date: "",
  });
  const [rawImage, setRawImage] = useState(null); // original selected image
  const [imageFile, setImageFile] = useState(null); // cropped image file
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showCropper, setShowCropper] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef(null);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Fetch benefit details
  useEffect(() => {
    if (!benefitId) return;

    const fetchBenefit = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/benefits/${benefitId}`);
        setFormData(res.data);
        if (res.data.image_url) {
          setImagePreview(res.data.image_url);
        }
      } catch (err) {
        console.error("Failed to fetch benefit:", err);
        setMessage("Failed to load benefit details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBenefit();
  }, [benefitId]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setMessage("Only JPG, JPEG, or PNG files are allowed.");
      return;
    }

    setMessage("");
    setRawImage(URL.createObjectURL(file));
    setShowCropper(true);
  };

  // Crop complete handler
  const handleCropComplete = (croppedBlob) => {
    const fileName = `benefit_${Date.now()}.png`;
    const croppedFile = new File([croppedBlob], fileName, {
      type: "image/png",
    });
    setImageFile(croppedFile);
    setImagePreview(URL.createObjectURL(croppedFile));
    setShowCropper(false);
  };

  // Update benefit
  const handleUpdate = async () => {
    if (!formData.type || !formData.title || !formData.description) {
      setMessage("Type, title, and description are required.");
      return;
    }

    setSaving(true);
    setShowConfirmModal(false);
    setMessage("");

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) payload.append(key, value);
      });
      if (imageFile) payload.append("image", imageFile);

      await axios.put(`${backendUrl}/api/benefits/${benefitId}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setMessage("Benefit updated successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to update benefit:", err);
      setMessage("Failed to update benefit.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-500 text-center">Loading...</p>;

  // Dynamic fields based on type
  const typeFields =
    formData.type === "republic acts"
      ? [
          {
            name: "title",
            label: "Title",
            type: "text",
            icon: (
              <Info className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            ),
          },
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
      <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Edit className="w-6 h-6 text-indigo-600" /> Update Benefit
      </h1>

      {message && (
        <p
          className={`mb-4 px-4 py-3 rounded-lg ${
            message.includes("Failed")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
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
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium">Benefit Image</label>
          <div className="flex items-center gap-4 mt-2">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="object-cover border rounded w-40 h-40"
              />
            ) : (
              <div className="flex items-center justify-center text-gray-400 border rounded w-40 h-40">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Select Type --</option>
              <option value="discount">Discount</option>
              <option value="financial assistance">Financial Assistance</option>
              <option value="medical benefits">Medical Benefits</option>
              <option value="privileges and perks">Privileges and Perks</option>
              <option value="republic acts">Republic Acts</option>
            </select>
          </div>

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

          <div className="md:col-span-2">
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

        {/* Save Button */}
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

        {/* Confirm Modal */}
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

        {/* Cropper Modal */}
        {showCropper && rawImage && (
          <CropperModal
            imageSrc={rawImage}
            onClose={() => setShowCropper(false)}
            onCropComplete={handleCropComplete}
            aspect={1}
          />
        )}
      </form>
    </div>
  );
};

export default UpdateBenefit;
