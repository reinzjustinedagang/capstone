import React, { useState } from "react";
import {
  PercentIcon,
  Stethoscope,
  ShieldCheck,
  HandCoins,
  Plus,
  BookOpenTextIcon,
  CheckCircle,
  PhilippinePeso,
  Earth,
  Landmark,
} from "lucide-react";
import National from "./National";
import Local from "./Local";
import RepublicActs from "./RepublicActs";
import Modal from "../../UI/Modal";
import Button from "../../UI/Button";
import AddBenefit from "../../benefits/AddBenefit";
import UpdateBenefit from "../../benefits/UpdateBenefit";

const Benefits = () => {
  const [activeTab, setActiveTab] = useState("local");
  const [selectedBenefitId, setSelectedBenefitId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // This function handles the edit action from any BenefitsCard
  const handleEdit = (id) => {
    setSelectedBenefitId(id); // Set the ID of the benefit to be updated
    setActiveTab("updatebenefits"); // Switch to the update tab
  };

  const handleUpdateSuccess = () => {
    setActiveTab("local");
    setSelectedBenefitId(null);
    setShowSuccessModal(true);
  };

  return (
    <>
      <div className="mt-4 md:mt-0 flex flex-col sm:flex-row justify-end sm:items-center mb-4">
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4 mr-2" />}
          onClick={() => setActiveTab("addbenefits")}
        >
          Add New Benefits
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab("local")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "local"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <Landmark className="inline-block h-4 w-4 mr-2" />
              Local Benefits
            </button>
            <button
              onClick={() => setActiveTab("national")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "national"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <Earth className="inline-block h-4 w-4 mr-2" /> National Benefits
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
          {/* Pass the handleEdit function as a prop to the components that render BenefitsCards */}
          {activeTab === "local" && <Local onEdit={handleEdit} />}
          {activeTab === "national" && <National onEdit={handleEdit} />}
          {activeTab === "ra" && <RepublicActs onEdit={handleEdit} />}
          {activeTab === "addbenefits" && <AddBenefit />}
          {activeTab === "updatebenefits" && (
            <UpdateBenefit
              benefitId={selectedBenefitId}
              onSuccess={handleUpdateSuccess}
            />
          )}
        </div>
      </div>
      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Success</h3>
          <p className="text-sm text-gray-600 mb-4">
            Benefit updated successfully!
          </p>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default Benefits;
