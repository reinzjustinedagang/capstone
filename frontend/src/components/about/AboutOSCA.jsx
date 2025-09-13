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
} from "lucide-react";

const AboutOSCA = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [settings, setSettings] = useState({
    mission: "",
    vision: "",
    preamble: "",
  });
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/settings/`);
        setSettings({
          mission: res.data.mission || "",
          vision: res.data.vision || "",
          preamble: res.data.preamble || "",
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post(`${backendUrl}/api/settings/about-osca`, settings, {
        withCredentials: true,
      });
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to update About OSCA.");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded shadow p-6 mb-6 space-y-4">
        <div>
          <label>Preamble</label>
          <textarea
            value={settings.preamble}
            onChange={(e) =>
              setSettings({ ...settings, preamble: e.target.value })
            }
            rows={4}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label>Mission</label>
          <textarea
            value={settings.mission}
            onChange={(e) =>
              setSettings({ ...settings, mission: e.target.value })
            }
            rows={3}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label>Vision</label>
          <textarea
            value={settings.vision}
            onChange={(e) =>
              setSettings({ ...settings, vision: e.target.value })
            }
            rows={3}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setShowConfirm(true)} disabled={loading}>
            {loading ? (
              "Saving..."
            ) : (
              <>
                <SaveIcon className="mr-2" /> Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Update"
      >
        <p>Are you sure you want to save About OSCA?</p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setShowConfirm(false)}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Yes, Save
          </button>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)}>
        <div className="text-center p-6">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="text-green-500 w-6 h-6" />
          </div>
          <h3>Success!</h3>
          <p>About OSCA updated successfully.</p>
          <Button onClick={() => setShowSuccess(false)}>OK</Button>
        </div>
      </Modal>
    </>
  );
};

export default AboutOSCA;
