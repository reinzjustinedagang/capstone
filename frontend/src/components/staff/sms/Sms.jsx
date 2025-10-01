import React, { useState, useEffect } from "react";
import { MessageSquare, History } from "lucide-react";

import MessageHistory from "../../sms/MessageHistory";
import SendSMS from "../../sms/SendSMS";

const Sms = () => {
  const [activeTab, setActiveTab] = useState("send");
  // ✅ modal states

  const tabs = [
    { key: "send", label: "Send SMS", icon: MessageSquare },
    { key: "history", label: "Message History", icon: History },
  ];

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Send SMS Tab */}
        {activeTab === "send" && <SendSMS />}
        {activeTab === "history" && <MessageHistory />}
      </div>
    </div>
  );
};

export default Sms;
