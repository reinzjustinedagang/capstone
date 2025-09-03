import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  PercentIcon,
  Stethoscope,
  ShieldCheck,
  ArrowUp,
  Plus,
  ArchiveRestore,
  CheckCircle,
} from "lucide-react";
import Modal from "../UI/Modal";

import Button from "../UI/Button";
import AddSenior from "./AddSenior";
import SeniorCitizenList from "./SeniorCitizenList";
import SeniorCitizenForm from "./SeniorCitizenForm";

const SeniorCitizen = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  const handleAddSuccess = () => {
    setActiveTab("list");
    setShowSuccessModal(true);
  };

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
          <NavLink to="/admin/recycle-bin">
            <Button
              variant="secondary"
              icon={<ArchiveRestore className="h-4 w-4 mr-2" />}
              className="relative hover:bg-gray-200"
            >
              Recycle Bin
              {/* <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                1
              </span> */}
            </Button>
          </NavLink>
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

        {activeTab === "add" && (
          <SeniorCitizenForm onSuccess={handleAddSuccess} />
        )}
      </div>

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
            Senior Citizen Added successfully!
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
