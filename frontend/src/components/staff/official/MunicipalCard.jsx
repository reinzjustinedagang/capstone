import React from "react";
import { UserIcon, Edit, Trash2 } from "lucide-react";
import user from "../../../assets/user.png";

const MunicipalCard = ({ official, isHead = false }) => {
  const imageUrl = official.image ? `${official.image}` : null;

  return (
    <div
      className={`relative flex flex-col items-center bg-white p-4 rounded-2xl shadow-md w-48 transition-transform transform ${
        isHead ? "border-2 border-blue-500" : "border border-gray-200"
      }`}
    >
      {/* Profile Picture */}
      <div className="relative mb-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${official.name}'s profile`}
            className="w-24 h-24 object-cover rounded-full border-4 border-blue-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/128x128/cccccc/ffffff?text=No+Image`;
              e.target.className =
                "w-24 h-24 object-contain rounded-full mx-auto";
            }}
          />
        ) : (
          <img
            src={user}
            alt={`${official.name}'s profile`}
            className="w-24 h-24 object-cover rounded-full border-4 border-blue-500"
          />
        )}
      </div>

      {/* Name */}
      <p
        className="text-sm font-medium max-w-full text-center truncate"
        title={official.name}
      >
        {official.name}
      </p>

      {/* Position */}
      <span className="text-sm bg-blue-100 text-blue-700 mt-1 px-3 py-0.5 rounded-md font-medium">
        {official.position}
      </span>
    </div>
  );
};

export default MunicipalCard;
