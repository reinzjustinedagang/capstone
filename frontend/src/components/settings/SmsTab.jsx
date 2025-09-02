import { useState, useEffect } from "react";
import {
  SaveIcon,
  Loader2,
  CheckCircle,
  XCircle,
  KeyRound,
  MessageCircleCode,
} from "lucide-react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import axios from "axios";

const SmsCredentialsForm = () => {
  const [apiKey, setApiKey] = useState("");
  const [senderId, setSenderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchCredentials = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${backendUrl}/api/sms/sms-credentials`, {
          withCredentials: true,
        });
        if (res.status === 200 && res.data) {
          setApiKey(res.data.api_key || "");
          setSenderId(res.data.sender_id || "");
        }
      } catch (err) {
        setError("Failed to fetch SMS credentials.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCredentials();
  }, [backendUrl]);

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await axios.put(
        `${backendUrl}/api/sms/sms-credentials`,
        { api_key: apiKey, sender_id: senderId },
        { withCredentials: true }
      );

      if (res.status === 200) {
        setSuccessMessage("✅ SMS credentials updated successfully.");
      } else {
        setError("❌ Failed to update SMS credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("❌ Error updating SMS credentials.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            API Key
          </label>
          <div className="mt-1 relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sender ID
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <MessageCircleCode className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center"
          role="alert"
        >
          <XCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center"
          role="alert"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          icon={
            saving ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <SaveIcon className="h-4 w-4 mr-2" />
            )
          }
          disabled={saving}
          onClick={() => setShowConfirmModal(true)}
        >
          {saving ? "Saving..." : "Save SMS Credentials"}
        </Button>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Update"
      >
        <div className="mt-4 text-sm text-gray-700">
          Are you sure you want to update your SMS credentials?
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
            onClick={() => {
              setShowConfirmModal(false);
              handleSubmit();
            }}
            className={`px-4 py-2 rounded text-sm ${
              saving
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {saving ? "Saving..." : "Yes, Save"}
          </button>
        </div>
      </Modal>
    </form>
  );
};

export default SmsCredentialsForm;
