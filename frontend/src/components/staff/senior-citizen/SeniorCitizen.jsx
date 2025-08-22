import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  PercentIcon,
  Stethoscope,
  ShieldCheck,
  ArrowUp,
  Plus,
  ArchiveRestore,
  CheckCircle,
} from "lucide-react";
import Modal from "../../UI/Modal";

import Button from "../../UI/Button";
import AddSenior from "../../senior-citizen/AddSenior";
import SeniorCitizenList from "../../senior-citizen/SeniorCitizenList";

const SeniorCitizen = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        <div className="relative w-full sm:w-64">
          {activeTab === "add" ? (
            <div
              className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setActiveTab("list")}
            >
              <ArrowUp className="h-5 w-5 mr-2 -rotate-90" />
              Back to Senior Citizens
            </div>
          ) : (
            <></>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4 mr-2" />}
            onClick={() => setActiveTab("add")}
          >
            Add New Senior Citizen
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeTab === "list" && <SeniorCitizenList />}

        {activeTab === "add" && <AddSenior />}
        {activeTab === "updatebenefits" && (
          <UpdateBenefit
            benefitId={selectedBenefitId}
            onSuccess={handleUpdateSuccess}
          />
        )}
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

export default SeniorCitizen;
