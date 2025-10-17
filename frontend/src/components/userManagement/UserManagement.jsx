import React, { useState, useMemo, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Button from "../UI/Button"; // Assuming you have a Button component
import Modal from "../UI/Modal";
import axios from "axios";
import {
  Search,
  Plus,
  Edit,
  UserX2,
  UserCheck2,
  CheckCircle,
  UserRoundMinus,
} from "lucide-react";
import AddUser from "./AddUser";
import UpdateUser from "./UpdateUser";
import UserList from "./UserList";
import BlockedUsers from "./BlockedUsers";
import UnregisteredUserList from "./UnregisteredUserList";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleEdit = (id) => {
    console.log("id:", id);
    setSelectedUserId(id); // Set the ID of the benefit to be updated
    setActiveTab("update"); // Switch to the update tab
  };

  const handleUpdateSuccess = () => {
    setActiveTab("list");
    setSelectedUserId(null);
    setShowSuccessModal(true);
  };

  return (
    <>
      <div className="mt-4 md:mt-0 flex flex-col sm:flex-row justify-end sm:items-center mb-4">
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4 mr-2" />}
          onClick={() => setActiveTab("add")}
        >
          Add New User
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
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
              <UserCheck2 className="inline-block h-4 w-4 mr-2" /> Registered
              User
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
              <UserRoundMinus className="inline-block h-4 w-4 mr-2" />{" "}
              Unregistered User
            </button>
            <button
              onClick={() => setActiveTab("blocked")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "blocked"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <UserX2 className="inline-block h-4 w-4 mr-2" /> Blocked User
            </button>
          </nav>
        </div>

        <div className="">
          {activeTab === "list" && <UserList onEdit={handleEdit} />}
          {activeTab === "unregistered" && (
            <UnregisteredUserList onEdit={handleEdit} />
          )}
          {activeTab === "blocked" && <BlockedUsers />}
          {activeTab === "update" && (
            <UpdateUser
              id={selectedUserId}
              onSuccess={handleUpdateSuccess}
              onCancel={() => {
                setActiveTab("list");
              }}
            />
          )}
          {activeTab === "add" && <AddUser />}
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

export default UserManagement;
