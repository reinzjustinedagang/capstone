import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Settings as SettingsIconLucide, // Renamed to avoid conflict with component name
  ShieldCheck,
  BellRing,
} from "lucide-react";
import SmsTab from "./SmsTab";
import SystemTab from "./SystemTab";
import SecurityTab from "./SecurityTab";
import NotificationTab from "./NotificationTab";
import FormFieldsPage from "./FormFieldPage";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("system");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#senior-form") {
        setActiveTab("senior-form");
      }
      // You can add more conditions here for other tabs if needed
    };

    // Set initial tab based on hash
    handleHashChange();

    // Listen for hash changes in case the user navigates within the same page
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <>
      {/* <h1 className="text-2xl font-bold mb-6">Settings</h1> */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            {" "}
            {/* Added flex-wrap for responsiveness */}
            <button
              onClick={() => setActiveTab("system")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "system"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <SettingsIconLucide className="inline-block h-4 w-4 mr-2" />{" "}
              System Settings
            </button>
            <button
              onClick={() => setActiveTab("sms")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "sms"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <MessageSquare className="inline-block h-4 w-4 mr-2" /> SMS
              Settings
            </button>
            <button
              onClick={() => setActiveTab("senior-form")}
              id="senior-form"
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "senior-form"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <MessageSquare className="inline-block h-4 w-4 mr-2" /> Senior
              Citizen Form
            </button>
            {/* <button
              onClick={() => setActiveTab("security")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "security"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <ShieldCheck className="inline-block h-4 w-4 mr-2" /> Security
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "notifications"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <BellRing className="inline-block h-4 w-4 mr-2" /> Notifications
            </button> */}
          </nav>
        </div>
        <div className="p-6">
          {activeTab === "sms" && <SmsTab />}
          {activeTab === "system" && <SystemTab />}
          {activeTab === "senior-form" && <FormFieldsPage />}
          {activeTab === "notifications" && <NotificationTab />}
        </div>
      </div>
    </>
  );
};

export default Settings;
