import React, { useState } from "react";
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

const Settings = () => {
  const [activeTab, setActiveTab] = useState("system");

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
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "notifications" && <NotificationTab />}
        </div>
      </div>
    </>
  );
};

export default Settings;
