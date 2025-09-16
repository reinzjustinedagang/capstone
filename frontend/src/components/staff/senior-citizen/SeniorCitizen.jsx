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
import SeniorCitizenList from "./SeniorCitizenList";
import SeniorCitizenForm from "../../senior-citizen/form/SeniorCitizenForm";
import UpdateSeniorCitizenForm from "../../senior-citizen/form/UpdateSeniorCitizenForm";

const SeniorCitizen = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedCitizenId, setSelectedCitizenId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const handleAddSuccess = () => {
    setActiveTab("list");
    setShowSuccessModal(true);
  };

  const handleUpdateSuccess = () => {
    setActiveTab("list");
    setShowUpdateModal(true);
  };

  const handleEdit = (id) => {
    setSelectedCitizenId(id); // Set the ID of the benefit to be updated
    setActiveTab("update"); // Switch to the update tab
  };

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        <div className="relative w-full sm:w-64">
          {activeTab !== "list" && (
            <div
              className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() =>
                activeTab === "view" && selectedCitizenId
                  ? setActiveTab("unregistered")
                  : setActiveTab("list")
              }
            >
              <ArrowUp className="h-5 w-5 mr-2 -rotate-90" />
              Back to Senior Citizens
            </div>
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
        {activeTab === "list" && <SeniorCitizenList onEdit={handleEdit} />}

        {activeTab === "update" && (
          <UpdateSeniorCitizenForm
            id={selectedCitizenId}
            onSuccess={handleUpdateSuccess}
            onCancel={() => {
              setActiveTab("list");
            }}
          />
        )}
        {activeTab === "add" && (
          <SeniorCitizenForm
            onSuccess={handleAddSuccess}
            onCancel={() => {
              setActiveTab("list");
            }}
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
