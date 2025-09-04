import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import {
  SaveIcon,
  Loader2,
  Target,
  Eye,
  ScrollText,
  CheckCircle,
  XCircle,
} from "lucide-react";

const AboutOSCA = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    mission: "",
    vision: "",
    preamble: "",
  });

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch settings on load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/settings/`);
        setSettings(res.data);
      } catch (err) {
        console.error("Failed to fetch system settings:", err);
      }
    };
    fetchSettings();
  }, [backendUrl]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post(`${backendUrl}/api/settings/about`, settings, {
        withCredentials: true,
      });
      setShowSuccessModal(true); // Show success modal
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Failed to update. Please try again.");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="space-y-6">
        {/* Mission */}
        <div className="mt-4">
          <label className="block text-base font-medium text-gray-700">
            Mission
          </label>
          <div className="mt-1 relative">
            <textarea
              value={settings.mission}
              onChange={(e) =>
                setSettings({ ...settings, mission: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows={3}
            />
            <Target className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Vision */}
        <div className="mt-4">
          <label className="block text-base font-medium text-gray-700">
            Vision
          </label>
          <div className="mt-1 relative">
            <textarea
              value={settings.vision}
              onChange={(e) =>
                setSettings({ ...settings, vision: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows={3}
            />
            <Eye className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Preamble */}
        <div className="mt-4">
          <label className="block text-base font-medium text-gray-700">
            Preamble
          </label>
          <div className="mt-1 relative">
            <textarea
              value={settings.preamble}
              onChange={(e) =>
                setSettings({ ...settings, preamble: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows={4}
            />
            <ScrollText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setShowConfirmModal(true)} // Open confirm modal
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
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Update"
      >
        <div className="mt-4 text-sm text-gray-700">
          Are you sure you want to save changes to About OSCA?
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
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
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title=""
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Success</h3>
          <p className="text-sm text-gray-600 mb-4">
            About OSCA updated successfully!
          </p>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AboutOSCA;
