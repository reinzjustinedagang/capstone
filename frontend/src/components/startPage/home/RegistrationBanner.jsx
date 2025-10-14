import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";

const RegistrationBanner = () => {
  const [animatedCount, setAnimatedCount] = useState(0);
  const [citizenCount, setCitizenCount] = useState(0);
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  // Fetch senior citizen count
  const fetchCitizenCount = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/senior-citizens/count/all`
      );
      setCitizenCount(res.data.count);
    } catch (err) {
      console.error("Failed to fetch senior citizen count", err);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchCitizenCount();
  }, []);

  // Animate the count whenever citizenCount changes
  useEffect(() => {
    if (citizenCount === 0) return;

    let start = 0;
    const end = citizenCount;
    const incrementTime = 2000 / end;

    const timer = setInterval(() => {
      start += Math.ceil(end / 200); // speed up animation
      if (start > end) start = end;
      setAnimatedCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [citizenCount]);

  return (
    <section className="bg-white py-6 md:px-25 text-center shadow-md">
      <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-2">
        {animatedCount.toLocaleString()}
      </h2>
      <p className="text-lg md:text-xl font-semibold text-blue-700 mb-4">
        REGISTRANTS AS OF TODAY
      </p>
      <p className="text-gray-800 max-w-2xl mx-auto text-center mb-6">
        Let us build a reliable database of all Senior Citizens in San Jose,
        Occidental Mindoro. Join the community, register, and be counted today!
      </p>

      {/* Registration Instructions */}
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-8 text-left">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          How to Register for OSCA ID
        </h3>

        {/* Qualifications */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">
            Qualifications:
          </h4>
          <ul className="space-y-2 text-gray-700 ml-4">
            <li>• Filipino Citizen aged 60 years old and above</li>
            <li>
              • Must be an actual/current resident of San Jose, Occidental
              Mindoro
            </li>
            <li>
              • Dual citizenship holders must prove Filipino citizenship and 6
              months Philippine residency
            </li>
          </ul>
        </div>

        {/* Requirements */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">
            Requirements:
          </h4>
          <div className="bg-white rounded-lg p-4 mb-3">
            <p className="font-medium text-gray-800 mb-2">
              1. One photocopy of any valid ID:
            </p>
            <ul className="text-gray-600 text-sm ml-6 space-y-1">
              <li>• Certificate of Live Birth</li>
              <li>• Social Security System (SSS)</li>
              <li>• Government Service Insurance System (GSIS)</li>
              <li>• Driver's License</li>
              <li>• Philippine Passport</li>
              <li>• COMELEC ID</li>
              <li>• Voter's Certification</li>
              <li>• Baptismal Certificate</li>
              <li>• Marriage Contract with Date of Birth</li>
              <li>• Unified Multi-Purpose ID (UMID)</li>
            </ul>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li>2. Three (3) latest 1x1 photos with white background</li>
            <li>
              3. Issuance of OSCA ID & Senior Citizens Purchase Booklet are FREE
            </li>
          </ul>
        </div>

        {/* How to Apply Steps */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">
            How to Apply:
          </h4>
          <ol className="space-y-3 text-gray-700">
            <li className="flex">
              <span className="font-bold text-blue-600 mr-2">1.</span>
              <span>
                Obtain the Application Form from your local Office for Senior
                Citizens Affairs (OSCA)
              </span>
            </li>
            <li className="flex">
              <span className="font-bold text-blue-600 mr-2">2.</span>
              <span>Gather all required documents mentioned above</span>
            </li>
            <li className="flex">
              <span className="font-bold text-blue-600 mr-2">3.</span>
              <span>
                Submit the completed application form and all required documents
                to your local OSCA office
              </span>
            </li>
            <li className="flex">
              <span className="font-bold text-blue-600 mr-2">4.</span>
              <span>
                OSCA office will review your application and documents
              </span>
            </li>
            <li className="flex">
              <span className="font-bold text-blue-600 mr-2">5.</span>
              <span>
                Once approved, you will receive your Senior Citizens ID
              </span>
            </li>
          </ol>
        </div>
      </div>

      {/* <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
        <NavLink to="/register-senior">
          <button className="m-5 px-6 py-3 bg-blue-700 text-white font-semibold rounded-md hover:bg-blue-800 transition">
            Register Now!
          </button>
        </NavLink>
      </div> */}
      {/* <div className="flex flex-col sm:flex-row justify-center gap-8 mt-4 text-gray-700">
        <div>
          <p className="font-semibold">How to Register?</p>
          <NavLink
            to="/register-guide"
            className="underline hover:text-blue-700 text-sm"
          >
            Online Registration User Guide
          </NavLink>
        </div>
        <div>
          <p className="font-semibold">View Registration Count</p>
          <NavLink
            to="/organization#demographics"
            className="underline hover:text-blue-700 text-sm"
          >
            Registration Distribution by Barangay
          </NavLink>
        </div>
      </div> */}
    </section>
  );
};

export default RegistrationBanner;
