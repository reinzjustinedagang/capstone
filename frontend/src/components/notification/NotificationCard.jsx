import React from "react";
import { Cake, Crown, Send } from "lucide-react";
import Button from "../UI/Button";

const NotificationCard = ({ celebrant, onSend, isSent }) => {
  const isCentenarian = celebrant.age >= 100;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`p-2 rounded-full ${
            isCentenarian
              ? "bg-yellow-100 text-yellow-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {isCentenarian ? (
            <Crown className="w-5 h-5" />
          ) : (
            <Cake className="w-5 h-5" />
          )}
        </div>

        <div>
          <h3 className="text-gray-900 font-semibold text-base leading-tight">
            {celebrant.name}
          </h3>
          <p className="text-xs text-gray-500">
            {isCentenarian ? "Centenarian Celebrant" : "Birthday Celebrant"}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-1 text-sm text-gray-700">
        <p>
          <span className="font-medium text-gray-600">Barangay:</span>{" "}
          {celebrant.barangay || "N/A"}
        </p>
        <p>
          <span className="font-medium text-gray-600">Age:</span>{" "}
          {celebrant.age || "N/A"}
        </p>
        <p>
          <span className="font-medium text-gray-600">Birthdate:</span>{" "}
          {celebrant.birthdate || "N/A"}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-5 flex justify-end">
        <Button
          variant={isSent ? "secondary" : "primary"}
          onClick={() => !isSent && onSend(celebrant)}
          disabled={isSent}
          icon={<Send className="h-4 w-4 mr-2" />}
        >
          {isSent ? "Sent" : "Send SMS"}
        </Button>
      </div>
    </div>
  );
};

export default NotificationCard;
