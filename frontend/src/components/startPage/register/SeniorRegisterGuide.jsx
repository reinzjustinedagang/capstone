import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  FileText,
  ClipboardList,
} from "lucide-react";
import Button from "../../UI/Button";

const SeniorRegisterGuide = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState({
    qualifications: false,
    requirements: false,
    howto: false,
  });

  const toggleSection = (key) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-7xl mx-auto my-6">
      {/* Section Header */}
      <div className="text-center px-5 py-6 md:px-25 bg-white">
        <h2 className="text-3xl font-bold text-gray-900">
          Guide to Register for Senior Citizen
        </h2>
        <p className="text-gray-800 mt-2 max-w-3xl mx-auto">
          Learn the qualifications, requirements, and process to register for a
          Senior Citizen with the Office for Senior Citizens Affairs (OSCA) in
          San Jose, Occidental Mindoro.
        </p>
      </div>

      <div className="space-y-6 md:p-5">
        {/* Qualifications */}
        <div className="bg-gray-50 rounded-md border border-gray-200">
          <div
            onClick={() => toggleSection("qualifications")}
            className="cursor-pointer flex justify-between items-center p-4 bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-semibold text-gray-900">
                Qualifications
              </h3>
            </div>
          </div>

          <div className="p-4 text-base text-gray-800 space-y-2">
            <ul className="list-disc list-inside space-y-2">
              <li>Must be a Filipino citizen, 60 years old and above.</li>
              <li>
                Dual citizens must present proof of Filipino citizenship with at
                least 6 months residency in the Philippines.
              </li>
              <li>
                Must be an actual/current resident of San Jose, Occidental
                Mindoro.
              </li>
            </ul>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-gray-50 rounded-md border border-gray-200">
          <div
            onClick={() => toggleSection("requirements")}
            className="cursor-pointer flex justify-between items-center p-4 bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-semibold text-gray-900">
                Requirements
              </h3>
            </div>
          </div>

          <div className="p-4 text-base text-gray-800 space-y-3">
            <p>
              Submit photocopy of <span className="font-semibold">any ONE</span>{" "}
              of the following:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 ml-4">
              <li>Certificate of Live Birth</li>
              <li>Social Security System (SSS) ID</li>
              <li>Government Service Insurance System (GSIS) ID</li>
              <li>Driver’s License</li>
              <li>Philippine Passport</li>
              <li>COMELEC ID / Voter’s Certification</li>
              <li>Baptismal Certificate</li>
              <li>Marriage Contract with Date of Birth</li>
              <li>Unified Multi-Purpose ID (UMID)</li>
            </div>
            <p>Plus: Latest 1x1 photos with white background.</p>
          </div>
        </div>

        {/* How to Apply */}
        <div className="bg-gray-50 rounded-md border border-gray-200">
          <div
            onClick={() => toggleSection("howto")}
            className="cursor-pointer flex justify-between items-center p-4 bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-semibold text-gray-900">
                How to Apply
              </h3>
            </div>
          </div>

          <div className="p-4 text-base text-gray-800 space-y-2">
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Obtain the application form from the Office for Senior Citizens
                Affairs (OSCA).
              </li>
              <li>Gather all required documents.</li>
              <li>
                Submit the completed application form with documents to OSCA.
              </li>
              <li>Wait for processing and verification by OSCA.</li>
              <li>Once approved, receive your Senior Citizens ID.</li>
            </ol>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={() => navigate("/register-senior")}
          >
            Register Senior Citizen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SeniorRegisterGuide;
