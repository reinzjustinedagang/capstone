import React from "react";
import { Edit, Trash2 } from "lucide-react";
import user from "../../../assets/user.png";

const MunicipalCard = ({ official, onEdit, onDelete, isHead = false }) => {
  const imageUrl = official.image ? `${official.image}` : null;

  return (
    <div
      className={`
        relative
        bg-white
        px-4
        py-2
        rounded-xl
        shadow-lg
        flex
        items-center
        text-left
        border-2
        ${isHead ? "border-blue-500" : "border-gray-200"}
      `}
    >
      {/* Left: Profile Picture */}
      <div className="flex-shrink-0 mr-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${official.name}'s profile`}
            className="h-20 w-20 object-cover border-2 rounded-lg border-blue-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/128x128/cccccc/ffffff?text=No+Image`;
            }}
          />
        ) : (
          <img
            src={user}
            alt={`${official.name}'s profile`}
            className="h-20 w-20 object-cover border-2 rounded-lg border-blue-500"
          />
        )}
      </div>

      {/* Right: Text + Actions */}
      <div className="flex flex-col">
        <div>
          <h3 className="text-sm font-semibold">{official.name}</h3>
          <p className="text-sm bg-blue-100 text-blue-700 mt-1 rounded-md font-medium px-3 py-0.5">
            {official.position}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex mt-2 gap-2">
          <button
            onClick={onEdit}
            aria-label={`Edit ${official.name}`}
            title="Edit Official"
            className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={onDelete}
            aria-label={`Delete ${official.name}`}
            title="Delete Official"
            className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-300 transition"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MunicipalCard;
