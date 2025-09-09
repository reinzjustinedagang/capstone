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
import SeniorCitizenList from "./SeniorCitizenList";
import SeniorCitizenForm from "./SeniorCitizenForm";
import UpdateSeniorCitizenForm from "./UpdateSeniorCitizenForm";
import UnregisteredSeniorList from "./UnregisteredSeniorList";

const SeniorCitizen = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedCitizenId, setSelectedCitizenId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const navigate = useNavigate();

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
          {activeTab === "add" || activeTab === "update" ? (
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
      <div className="bg-white rounded-t-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab("list")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                            ${
                              activeTab === "list"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
            >
              <PercentIcon className="inline-block h-4 w-4 mr-2" /> Registered
              Senior Citizen
            </button>
            <button
              onClick={() => setActiveTab("unregistered")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                            ${
                              activeTab === "unregistered"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
            >
              <PercentIcon className="inline-block h-4 w-4 mr-2" />
              Not Registered Senior Citizen
            </button>
          </nav>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden">
        {activeTab === "list" && <SeniorCitizenList onEdit={handleEdit} />}
        {activeTab === "unregistered" && (
          <UnregisteredSeniorList onEdit={handleEdit} />
        )}
        {activeTab === "add" && (
          <SeniorCitizenForm
            onSuccess={handleAddSuccess}
            onCancel={() => {
              setActiveTab("list");
            }}
          />
        )}
        {activeTab === "update" && (
          <UpdateSeniorCitizenForm
            id={selectedCitizenId}
            onSuccess={handleUpdateSuccess}
            onCancel={() => {
              setActiveTab("list");
            }}
          />
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

      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Success"
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Success</h3>
          <p className="text-sm text-gray-600 mb-4">
            Senior Citizen Updated successfully!
          </p>
          <Button variant="primary" onClick={() => setShowUpdateModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default SeniorCitizen;
