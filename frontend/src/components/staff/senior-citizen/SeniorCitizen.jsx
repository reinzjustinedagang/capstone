import React, { useState, useEffect } from "react";
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
import axios from "axios";

import Button from "../../UI/Button";
import SeniorCitizenForm from "../../senior-citizen/form/SeniorCitizenForm";
import UpdateSeniorCitizenForm from "../../senior-citizen/form/UpdateSeniorCitizenForm";
import SeniorCitizenList from "../../senior-citizen/SeniorCitizenList";
import SeniorCitizenID from "../../senior-citizen/SeniorCitizenID";
import SeniorCitizenIDPDF from "../../senior-citizen/SeniorCitizenIDPDF";

const SeniorCitizen = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedCitizenId, setSelectedCitizenId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedIDCitizen, setSelectedIDCitizen] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const [zipCode, setZipCode] = useState("");
  const [oscaHead, setOscaHead] = useState("");
  const [mayor, setMayor] = useState("");

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

  const handleId = (citizen) => {
    setSelectedIDCitizen(citizen);
    setActiveTab("id");
  };

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        <div className="relative w-full sm:w-64  mt-4 md:mt-0">
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

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto ">
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
        {activeTab === "list" && (
          <SeniorCitizenList onEdit={handleEdit} onId={handleId} />
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
        {activeTab === "add" && (
          <SeniorCitizenForm
            onSuccess={handleAddSuccess}
            onCancel={() => {
              setActiveTab("list");
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
