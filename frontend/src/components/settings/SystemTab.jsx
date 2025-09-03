import { useState, useRef, useEffect } from "react";
import {
  SaveIcon,
  Loader2,
  CheckCircle,
  XCircle,
  ImagePlus,
  Cpu,
  Landmark,
  Target,
  Eye,
  ScrollText,
  MapIcon,
} from "lucide-react";
import Button from "../UI/Button";
import axios from "axios";
import CropperModal from "../UI/CropperModal";
import Modal from "../UI/Modal";

const SystemTab = () => {
  const [formData, setFormData] = useState({
    systemName: "",
    municipality: "",
    province: "",
  });

  const [sealFile, setSealFile] = useState(null);
  const [sealPreview, setSealPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fileInputRef = useRef(null);
  const [showCropper, setShowCropper] = useState(false);
  const [rawImage, setRawImage] = useState(null);

  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchSystem = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${backendUrl}/api/settings/`, {
          withCredentials: true,
        });
        if (res.status === 200 && res.data) {
          setFormData({
            systemName: res.data.system_name || "",
            municipality: res.data.municipality || "",
            province: res.data.province || "",
          });
          setSealPreview(res.data.seal || null);
          setSealFile(null);
        }
      } catch (err) {
        setError("Failed to fetch system settings.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSystem();
  }, [backendUrl]);

  const handleSealChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSizeInBytes = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError("Only JPG, JPEG, or PNG files are allowed.");
      return;
    }
    if (file.size > maxSizeInBytes) {
      setError("File must be under 10MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setError(null);
    setRawImage(imageUrl);
    setShowCropper(true);
  };

  const handleCropComplete = (croppedFile) => {
    setSealFile(croppedFile);
    setSealPreview(URL.createObjectURL(croppedFile));
    setShowCropper(false);
  };

  const saveSystemSettings = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (!formData.systemName || !formData.municipality || !formData.province) {
      setError("All required fields must be filled.");
      setLoading(false);
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append("systemName", formData.systemName);
      formPayload.append("municipality", formData.municipality);
      formPayload.append("province", formData.province);
      formPayload.append("existingSeal", sealPreview || "");
      if (sealFile) formPayload.append("image", sealFile);

      const res = await axios.post(`${backendUrl}/api/settings/`, formPayload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        setSuccessMessage(
          res.data.message || "System settings updated successfully!"
        );
        setError("");
        setShowSuccessModal(true);
      } else {
        setError("Failed to update system settings.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to update system settings."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSuccess = () => {
    setShowSuccessModal(false);
    window.location.reload();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setShowConfirmModal(true);
      }}
      className="space-y-6"
    >
      {/* Municipality Seal */}
      <div>
        <label className="block text-sm font-medium">Municipality Seal</label>
        <div className="flex items-center gap-4 mt-2">
          {sealPreview ? (
            <img
              src={sealPreview}
              alt="Seal Preview"
              className="w-30 h-30 object-cover border rounded-full"
            />
          ) : (
            <div className="w-20 h-20 border flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="px-3 py-1 border rounded flex items-center gap-1 text-sm"
          >
            <ImagePlus size={16} /> Change
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png, image/jpeg"
            onChange={handleSealChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            System Name
          </label>
          <div className="mt-1 relative">
            <input
              value={formData.systemName}
              onChange={(e) =>
                setFormData({ ...formData, systemName: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <Cpu className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Municipality */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Municipality
          </label>
          <div className="mt-1 relative">
            <input
              value={formData.municipality}
              onChange={(e) =>
                setFormData({ ...formData, municipality: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <Landmark className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Province */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Province
          </label>
          <div className="mt-1 relative">
            <input
              value={formData.province}
              onChange={(e) =>
                setFormData({ ...formData, province: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <MapIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Errors */}
      {error && (
        <div className="text-red-600 flex items-center gap-2">
          <XCircle size={18} /> {error}
        </div>
      )}
      {successMessage && (
        <div className="text-green-600 flex items-center gap-2">
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
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Cropper Modal */}
      {showCropper && rawImage && (
        <CropperModal
          imageSrc={rawImage}
          onClose={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Update"
      >
        <div className="mt-4 text-sm text-gray-700">
          Are you sure you want to update your system settings?
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
              saveSystemSettings();
            }}
            className={`px-4 py-2 rounded text-sm ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {loading ? "Saving..." : "Yes, Save"}
          </button>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={handleConfirmSuccess} title="">
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Settings Updated Successfully
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Your system settings have been saved.
          </p>
          <Button variant="primary" onClick={handleConfirmSuccess}>
            OK
          </Button>
        </div>
      </Modal>
    </form>
  );
};

export default SystemTab;
