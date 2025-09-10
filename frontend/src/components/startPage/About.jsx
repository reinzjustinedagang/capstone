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
          <h1 className="text-3xl font-bold text-gray-900">About Us</h1>
          <p className="text-gray-800 mt-2 max-w-3xl mx-auto">
            Learn about the Office for Senior Citizens Affairs in San Jose, its
            mission, vision, and the services it provides to the community.
          </p>
        </div>

        {/* Preamble */}
        <div className="w-full px-5 py-5 md:px-8 lg:px-25 bg-white">
          <div className="p-4 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Preamble
            </h2>
            <p className="text-gray-800 leading-relaxed text-justify">
              {data.preamble}
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="w-full px-5 py-5 md:px-8 lg:px-25 bg-white">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Mission
              </h3>
              <p className="text-gray-800 leading-relaxed text-justify">
                {data.mission}
              </p>
            </div>
            <div className="p-4 text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Vision
              </h3>
              <p className="text-gray-800 leading-relaxed text-justify">
                {data.vision}
              </p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="w-full px-5 py-5 md:px-8 lg:px-25 bg-white">
          <div className="p-4 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Introduction
            </h2>
            <p className="text-gray-800 leading-relaxed text-justify">
              {data.preamble}
            </p>
          </div>
        </div>

        {/* Objectives */}
        <div className="w-full px-5 py-5 md:px-8 lg:px-25 bg-white">
          <div className="p-4 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Objectives
            </h2>
            <p className="text-gray-800 leading-relaxed text-justify">
              {data.preamble}
            </p>
          </div>
        </div>

        {/* Our Team */}
        <div className="w-full px-5 py-5 md:px-8 lg:px-25 bg-white">
          <div className="p-4 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Our Team
            </h2>
            <div className="flex justify-center space-x-6">
              {/* Circle Image */}
              <div className="flex-col justify-center">
                <img
                  src={data.teamImage} // make sure this points to your image URL
                  alt="Our Team"
                  className="w-30 h-30 rounded-full object-cover border-4 border-gray-200 shadow-lg mb-2"
                />
                <p className="font-semibold">Name</p>
                <p>Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
