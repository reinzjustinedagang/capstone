import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/settings/`);
        setSettings(res.data);
      } catch (err) {
        console.error("Failed to fetch system settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 🔹 Loader component (spinner + text)
  const SectionLoader = ({ text }) => (
    <div className="flex justify-center items-center py-4">
      <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      <p className="ml-2 text-gray-700">{text}</p>
    </div>
  );

  return (
    <div>
      <div className="space-y-10">
        {/* Mission */}
        <section className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-lg font-medium text-blue-700">Mission</h2>
          </div>
          {loading ? (
            <SectionLoader text="Loading Mission..." />
          ) : (
            <p className="mt-2 text-gray-800 whitespace-pre-line">
              {settings.mission || "No mission set."}
            </p>
          )}
        </section>

        {/* Vision */}
        <section className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-lg font-medium text-blue-700">Vision</h2>
          </div>
          {loading ? (
            <SectionLoader text="Loading Vision..." />
          ) : (
            <p className="mt-2 text-gray-800 whitespace-pre-line">
              {settings.vision || "No vision set."}
            </p>
          )}
        </section>

        {/* Preamble */}
        <section className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-lg font-medium text-blue-700">Preamble</h2>
          </div>
          {loading ? (
            <SectionLoader text="Loading Preamble..." />
          ) : (
            <p className="mt-2 text-gray-800 whitespace-pre-line">
              {settings.preamble || "No preamble set."}
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default AboutOsca;
