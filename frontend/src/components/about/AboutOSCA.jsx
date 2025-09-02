import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../UI/Button";
import { SaveIcon, Loader2, Target, Eye, ScrollText } from "lucide-react";

const AboutOSCA = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    mission: "",
    vision: "",
    preamble: "",
    system_name: "",
    municipality: "",
    seal: null,
  });

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

  // Handle save
  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`${backendUrl}/api/settings/`, settings);
      alert("About OSCA updated successfully!");
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Failed to update. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="space-y-6">
        {/* Mission */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
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
          <label className="block text-sm font-medium text-gray-700">
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
          <label className="block text-sm font-medium text-gray-700">
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
            onClick={handleSave}
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
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutOSCA;
