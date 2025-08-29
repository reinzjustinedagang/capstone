import React, { useEffect, useState } from "react";
import axios from "axios";

const AboutOSCA = () => {
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Preamble */}
        <div className="w-full px-5 py-6 md:px-8 lg:px-12 mb-6">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 text-center">
            Preamble
          </h2>
          <div className="p-4 border rounded-lg">
            <p className="text-gray-700 leading-relaxed text-justify">
              {settings.preamble ||
                "The Office for Senior Citizens Affairs (OSCA) is committed to ensuring the welfare, rights, and dignity of senior citizens. We aim to provide programs and services that enhance the quality of life of the elderly population in San Jose."}
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="w-full px-5 py-6 md:px-8 lg:px-12 mb-6">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
            Mission & Vision
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Mission
              </h3>
              <p className="text-gray-700 leading-relaxed text-justify">
                {settings.mission ||
                  "To provide social services, programs, and activities that promote the welfare, security, and well-being of senior citizens in our community."}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Vision
              </h3>
              <p className="text-gray-700 leading-relaxed text-justify">
                {settings.vision ||
                  "To be a model local government unit in empowering senior citizens, ensuring their rights, and enhancing their participation in community development."}
              </p>
            </div>
          </div>
        </div>

        {/* Mandate */}
        {/* <div className="w-full px-5 py-6 md:px-8 lg:px-12 mb-6">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 text-center">
            Mandate
          </h2>
          <div className="p-4 border rounded-lg">
            <p className="text-gray-700 leading-relaxed text-justify">
              OSCA is mandated to implement programs and services for senior
              citizens, including health assistance, social pension, advocacy,
              and community integration initiatives as per RA 9994 – Expanded
              Senior Citizens Act.
            </p>
          </div>
        </div> */}

        {/* Core Functions */}
        {/* <div className="w-full px-5 py-6 md:px-8 lg:px-12 mb-6">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 text-center">
            Core Functions
          </h2>
          <div className="p-4 border rounded-lg">
            <ul className="list-disc list-inside text-gray-700 space-y-2 max-w-3xl mx-auto">
              <li>Registration and issuance of senior citizen IDs.</li>
              <li>
                Monitoring and distribution of social pensions and benefits.
              </li>
              <li>
                Organization of senior citizen programs, seminars, and
                activities.
              </li>
              <li>Advocacy for senior citizens' rights and welfare.</li>
              <li>Data collection, reporting, and demographic studies.</li>
            </ul>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default AboutOSCA;
