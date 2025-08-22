import React from "react";
import { XCircle, CheckCircle } from "lucide-react";

const StatusMessage = ({ type, message }) => {
  if (!message) return null;

  const isError = type === "error";
  const bgColor = isError ? "bg-red-100" : "bg-green-100";
  const borderColor = isError ? "border-red-400" : "border-green-400";
  const textColor = isError ? "text-red-700" : "text-green-700";
  const Icon = isError ? XCircle : CheckCircle;

  return (
    <div
      className={`${bgColor} ${borderColor} ${textColor} border px-4 py-3 rounded-lg flex items-center mb-4`}
      role="alert"
    >
      <Icon className="h-5 w-5 mr-2" />
      <span>{message}</span>
    </div>
  );
};

export default StatusMessage;
