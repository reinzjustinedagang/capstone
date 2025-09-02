import React, { useEffect, useState } from "react";
import axios from "axios";
import MunicipalOfficials from "./MunicipalOfficials";
import BarangayOfficials from "./BarangayOfficials";
import { Landmark, User, ListTree } from "lucide-react";

const Officials = () => {
  const [activeTab, setActiveTab] = useState("barangay");
  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab("barangay")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "barangay"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <Landmark className="inline-block h-4 w-4 mr-2" />
              Barangay Association President
            </button>
            <button
              onClick={() => setActiveTab("federation")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "federation"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <User className="inline-block h-4 w-4 mr-2" />
              Municipal Federation Officer
            </button>
            <button
              onClick={() => setActiveTab("organizational")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "organizational"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <ListTree className="inline-block h-4 w-4 mr-2" />
              Organizational Chart
            </button>
          </nav>
        </div>
        <div className="p-6">
          {/* Pass the handleEdit function as a prop to the components that render BenefitsCards */}
          {activeTab === "barangay" && <BarangayOfficials />}
          {activeTab === "federation" && <MunicipalOfficials />}
          {activeTab === "organizational" && (
            <OrgChart title="Organizational Chart" />
          )}
        </div>
      </div>
    </>
  );
};

export default Officials;
