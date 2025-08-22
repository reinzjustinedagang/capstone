import React from "react";
import { UserCheck, MailIcon, PhoneCallIcon, Clock } from "lucide-react";

export default function UserInfoCard({ userData }) {
  return (
    <div className="text-center sm:text-left">
      <h2 className="text-md font-semibold text-gray-900">
        {userData.username}
      </h2>
      <p className="text-sm text-gray-600 flex items-center justify-center sm:justify-start mt-1">
        <UserCheck className="h-4 w-4 mr-2 text-blue-500" />
        <span className="capitalize">{userData.role || "User"}</span>
      </p>
      <p className="text-sm text-gray-600 flex items-center justify-center sm:justify-start mt-1">
        <MailIcon className="h-4 w-4 mr-2 text-gray-500" />
        {userData.email}
      </p>
      <p className="text-sm text-gray-600 flex items-center justify-center sm:justify-start mt-1">
        <PhoneCallIcon className="h-4 w-4 mr-2 text-gray-500" />
        {userData.cp_number}
      </p>
      <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start mt-2">
        <Clock className="h-4 w-4 mr-2 text-gray-400" />
        Last Login:{" "}
        {userData.last_login
          ? new Date(userData.last_login).toLocaleString("en-PH", {
              timeZone: "Asia/Manila",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : "N/A"}
      </p>
    </div>
  );
}
