import React, { useState, useMemo, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Button from "../UI/Button"; // Assuming you have a Button component
import Modal from "../UI/Modal"; // Assuming this is your general Modal component for all dialogs
import Modal2 from "../UI/Modal2";
import UserForm from "./UserForm";
import LoginTrail from "./LoginTrail";
import UserTable from "./UserTable";
import axios from "axios";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowDown,
  ArrowUp,
  ScrollText, // Added ScrollText for viewing login trails
  Loader2, // For loading indicators
  XCircle, // For error messages
  CheckCircle, // For success messages
  History,
} from "lucide-react";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        <div className="relative w-full sm:w-64">
          {activeTab === "login-trails" ? (
            <div
              className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setActiveTab("list")}
            >
              <ArrowUp className="h-5 w-5 mr-2 -rotate-90" />
              Back to User Management
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

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {activeTab === "list" && <UserTable />}
        {activeTab === "login-trail" && <LoginTrail />}
        {activeTab === "add" && <UserForm />}
      </div>
    </>
  );
};

export default UserManagement;
