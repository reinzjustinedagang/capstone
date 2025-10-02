import React from "react";
import { Edit, Trash2 } from "lucide-react";
import user from "../../../assets/user.png";

const OrgCard = ({ position, onEdit, onDelete, isTop = false }) => {
  const imageUrl = position.image || null;
  const isMember = position.type === "bottom"; // bottom-level node

  return (
    <div className="relative flex flex-col items-center">
      {/* Vertical line for members */}
      {isMember && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-[120%] w-0.5 bg-blue-400 z-0"></div>
      )}

      <div
        className={`relative z-10 bg-white px-3 py-2 rounded-lg shadow-md flex items-center text-left border
          ${isTop ? "border-blue-500" : "border-gray-200"}
          w-60 sm:w-64`}
      >
        {/* Pending Badge */}
        {position.approved === 0 && (
          <span className="absolute top-1 right-1 bg-yellow-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md shadow">
            Pending
          </span>
        )}

        {/* Left: Profile Picture */}
        <div className="flex-shrink-0 mr-3">
          <img
            src={imageUrl || user}
            alt={`${position.name}'s profile`}
            className="h-14 w-14 object-cover border-2 rounded-md border-blue-400"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/64x64/cccccc/ffffff?text=No+Img";
            }}
          />
        </div>

        {/* Right: Text + Actions */}
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate" title={position.name}>
            {position.name}
          </h3>
          <p
            className="text-xs bg-blue-100 text-blue-700 mt-1 rounded-md font-medium px-2 py-0.5 truncate"
            title={position.position}
          >
            {position.position}
          </p>

          {/* Action Buttons */}
          <div className="flex mt-2 gap-1">
            <button
              onClick={onEdit}
              aria-label={`Edit ${position.name}`}
              title="Edit"
              className="text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 p-1.5 rounded-full focus:outline-none transition"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              aria-label={`Delete ${position.name}`}
              title="Delete"
              className="text-red-600 hover:text-white bg-red-50 hover:bg-red-600 p-1.5 rounded-full focus:outline-none transition"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgCard;
