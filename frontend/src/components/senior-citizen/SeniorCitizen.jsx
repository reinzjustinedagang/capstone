import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PercentIcon,
  Stethoscope,
  ShieldCheck,
  ArrowUp,
  Plus,
  ArchiveRestore,
  CheckCircle,
  UserCheck,
  UserRoundCheck,
  UserRoundX,
  ArchiveIcon,
} from "lucide-react";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import SeniorCitizenList from "./SeniorCitizenList";
import SeniorCitizenForm from "./form/SeniorCitizenForm";
import UpdateSeniorCitizenForm from "./form/UpdateSeniorCitizenForm";
import UnregisteredSeniorList from "./UnregisteredSeniorList";
import GetUnregisteredSenior from "./form/GetUnregisteredSenior";
import Archive from "../archive/Archive";
import SeniorCitizenIDPDF from "./SeniorCitizenIDPDF";

const SeniorCitizen = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedCitizenId, setSelectedCitizenId] = useState(null);
  const [selectedIDCitizen, setSelectedIDCitizen] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const [zipCode, setZipCode] = useState("");
  const [oscaHead, setOscaHead] = useState("");
  const [mayor, setMayor] = useState("");

  const navigate = useNavigate();

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchOfficials = async () => {
      try {
        const zip = await axios.get(`${backendUrl}/api/settings/`);
        setZipCode(zip.data.zipCode || "");

        const head = await axios.get(`${backendUrl}/api/officials/head`);
        setOscaHead(head.data?.name || "");

        const mayorRes = await axios.get(`${backendUrl}/api/officials/mayor`);
        setMayor(mayorRes.data?.name || "");
      } catch (err) {
        console.error("Failed to fetch officials:", err);
      }
    };

    fetchOfficials();
  }, [backendUrl]);

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

  const onView = (id) => {
    setSelectedCitizenId(id); // Set the ID of the benefit to be
    setActiveTab("view");
  };

  const onRegister = (id) => {
    setSelectedCitizenId(id);
    setActiveTab("view"); // or "register" if you want a different flow
  };

  const handleId = (citizen) => {
    setSelectedIDCitizen(citizen);
    setActiveTab("id");
  };

  return (
    <>
      <div className="mt-4 mb-4 md:mt-0 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        <div className="relative w-full sm:w-64 mb-4 md:mb-0">
          {activeTab !== "list" &&
            activeTab !== "unregistered" &&
            activeTab !== "archived" && (
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
          {/* Add New Senior Citizen */}
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4 mr-2" />}
            onClick={() => setActiveTab("add")}
            className="w-full sm:w-auto flex justify-center"
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
              <UserRoundCheck className="inline-block h-4 w-4 mr-2" />{" "}
              Registered Senior Citizen
            </button>
            {/* <button
              onClick={() => setActiveTab("unregistered")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                            ${
                              activeTab === "unregistered"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
            >
              <UserRoundX className="inline-block h-4 w-4 mr-2" />
              Not Registered Senior Citizen
            </button> */}
            <button
              onClick={() => setActiveTab("archived")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                            ${
                              activeTab === "archived"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
            >
              <ArchiveIcon className="inline-block h-4 w-4 mr-2" />
              Archived Senior Citizen
            </button>
          </nav>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden">
        {activeTab === "list" && (
          <SeniorCitizenList onEdit={handleEdit} onId={handleId} />
        )}
        {activeTab === "unregistered" && (
          <UnregisteredSeniorList onView={onView} onRegister={onRegister} />
        )}
        {activeTab === "archived" && <Archive />}
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
        {activeTab === "view" && (
          <GetUnregisteredSenior
            id={selectedCitizenId}
            onSuccess={handleUpdateSuccess}
            onCancel={() => {
              setActiveTab("unregistered");
            }}
          />
        )}
        {activeTab === "id" && (
          <SeniorCitizenIDPDF
            citizen={selectedIDCitizen}
            zipCode={zipCode}
            oscaHead={oscaHead}
            mayor={mayor}
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
