import React, { useEffect, useState } from "react";
import axios from "axios";

const AboutOsca = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [settings, setSettings] = useState({
    mission: "",
    vision: "",
    preamble: "",
    system_name: "",
    municipality: "",
    seal: null,
  });

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
  }, []);

  return (
    <div>
      <div className="space-y-10">
        <section className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-lg font-medium text-blue-700">Mission</h2>
          </div>
          <p className="mt-2 text-gray-800 whitespace-pre-line">
            {settings.mission || "No mission set."}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-lg font-medium text-blue-700">Vision</h2>
          </div>
          <p className="mt-2 text-gray-800 whitespace-pre-line">
            {settings.vision || "No vision set."}
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-lg font-medium text-blue-700">Preamble</h2>
          </div>
          <p className="mt-2 text-gray-800 whitespace-pre-line">
            {settings.preamble || "No preamble set."}
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutOsca;
