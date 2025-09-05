import React, { useState } from "react";
import {
  PercentIcon,
  Stethoscope,
  ShieldCheck,
  HandCoins,
  Plus,
  BookOpenTextIcon,
} from "lucide-react";
import Discount from "../../benefits/Discount";
import FinancialAssistance from "../../benefits/FinancialAssistance";
import MedicalBenefits from "../../benefits/MedicalBenefits";
import PerksAndPrev from "../../benefits/PerksAndPrev";
import RepublicActs from "../../benefits/RepublicActs";

const Benefits = () => {
  const [activeTab, setActiveTab] = useState("discount");

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab("discount")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "discount"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <PercentIcon className="inline-block h-4 w-4 mr-2" /> Discount
            </button>
            <button
              onClick={() => setActiveTab("financialAssistance")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "financialAssistance"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <HandCoins className="inline-block h-4 w-4 mr-2" /> Financial
              Assistance
            </button>
            <button
              onClick={() => setActiveTab("medicalBenefits")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "medicalBenefits"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <Stethoscope className="inline-block h-4 w-4 mr-2" /> Medical
              Benefits
            </button>
            <button
              onClick={() => setActiveTab("perksAndPrev")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "perksAndPrev"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <ShieldCheck className="inline-block h-4 w-4 mr-2" />
              Privileges and Perks
            </button>
            <button
              onClick={() => setActiveTab("ra")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "ra"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <BookOpenTextIcon className="inline-block h-4 w-4 mr-2" />
              Republic Acts
            </button>
          </nav>
        </div>
        <div className="p-6">
          {activeTab === "discount" && <Discount />}
          {activeTab === "financialAssistance" && <FinancialAssistance />}
          {activeTab === "medicalBenefits" && <MedicalBenefits />}
          {activeTab === "perksAndPrev" && <PerksAndPrev />}
          {activeTab === "ra" && <RepublicActs />}
        </div>
      </div>
    </>
  );
};

export default Benefits;
