import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Copy, Plus, Save, XCircle } from "lucide-react";
import axios from "axios";
import Modal from "../UI/Modal";
import Button from "../UI/Button";

export default function Developer() {
  const navigate = useNavigate();
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [status, setStatus] = useState("success");

  const [cooldown, setCooldown] = useState(0); // seconds left
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const hasAccess = localStorage.getItem("developerAccess");
    if (!hasAccess) navigate("/login");

    const savedKey = localStorage.getItem("devKey") || "";
    const expiry = localStorage.getItem("devKeyExpiry");

    if (savedKey) setKey(savedKey);

    if (expiry) {
      const remaining = Math.floor((new Date(expiry) - new Date()) / 1000);
      if (remaining > 0) setCooldown(remaining);
    }
  }, [navigate]);

  // countdown effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("devKey");
          localStorage.removeItem("devKeyExpiry");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const generateKey = () => {
    const randomKey = Math.random().toString(36).substring(2, 12).toUpperCase();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min later

    setKey(randomKey);
    setCooldown(5 * 60); // 5 minutes in seconds
    localStorage.setItem("devKey", randomKey);
    localStorage.setItem("devKeyExpiry", expiry.toISOString());
  };

  const copyKey = () => {
    if (!key) return;
    navigator.clipboard.writeText(key);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const saveKey = async () => {
    if (!key) return;
    setSaving(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/settings/save-key`,
        { key },
        { withCredentials: true }
      );

      if (response.data.skipped) {
        setSuccessMessage("An unused developer key already exists.");
        setStatus("error");
      } else {
        setSuccessMessage("Developer key saved successfully!");
        setStatus("success");
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setSuccessMessage("Failed to save key.");
      setStatus("error");
      setShowSuccessModal(true);
    } finally {
      setSaving(false);
    }
  };

  // format countdown (mm:ss)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 font-inter overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 bottom-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6 p-8 bg-white rounded-xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Developer Dashboard
          </h1>
          <p className="mt-1 text-gray-600 text-sm">
            Generate and manage your developer key
          </p>
        </div>

        <button
          onClick={generateKey}
          disabled={cooldown > 0}
          className={`w-full flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-lg shadow-md transition-all duration-300 transform ${
            cooldown > 0
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105"
          }`}
        >
          <Plus className="h-5 w-5" />
          {cooldown > 0 ? `Cooldown: ${formatTime(cooldown)}` : "Generate Key"}
        </button>

        {key && (
          <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-sm mt-4">
            <span className="font-mono text-gray-800">{key}</span>
            <div className="flex gap-2">
              <button
                onClick={copyKey}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all duration-200 ${
                  copying
                    ? "bg-gray-400 text-gray-700"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>

              <button
                onClick={saveKey}
                disabled={saving}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all duration-200 ${
                  saving
                    ? "bg-blue-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 text-center block bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-lg transition-all duration-200"
        >
          Back to Login
        </button>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Status"
      >
        <div className="p-6 text-center flex flex-col items-center gap-4">
          {status === "success" ? (
            <CheckCircle className="w-12 h-12 text-green-500" />
          ) : (
            <XCircle className="w-12 h-12 text-gray-500" />
          )}

          <h3 className="text-lg font-medium text-gray-800">
            {status === "success" ? "Success" : "Failed"}
          </h3>

          <p className="text-sm text-gray-600 text-center">{successMessage}</p>

          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
}
