import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import slider5 from "../../assets/slider5.jpg";

const About = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/settings/`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch system settings:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <Header />

      <div>
        {/* Section Header */}
        <div className="w-full text-center px-5 py-5 md:px-8 lg:px-25 bg-white">
          <h1 className="text-2xl font-bold text-gray-900">About OSCA</h1>
          <p className="text-gray-600 mt-2 max-w-3xl mx-auto">
            Learn about the Office for Senior Citizens Affairs in San Jose, its
            mission, vision, and the services it provides to the community.
          </p>
        </div>

        {/* Preamble */}
        <div className="w-full px-5 py-5 md:px-8 lg:px-25 bg-white">
          <div className="p-4 border rounded-lg">
            <h2 className="text-2xl font-semibold text-blue-700 mb-3">
              Preamble
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              {data.preamble}
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="w-full px-5 py-5 md:px-8 lg:px-25 bg-white">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h3 className="text-2xl font-semibold text-blue-700 mb-3">
                Mission
              </h3>
              <p className="text-gray-700 leading-relaxed text-justify">
                {data.mission}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-2xl font-semibold text-blue-700 mb-3">
                Vision
              </h3>
              <p className="text-gray-700 leading-relaxed text-justify">
                {data.vision}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
