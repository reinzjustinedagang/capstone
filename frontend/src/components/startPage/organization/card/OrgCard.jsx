import React from "react";
import { Edit, Trash2 } from "lucide-react";
import user from "../../../../assets/user.png";

const OrgCard = ({ position, onEdit, onDelete, isTop = false }) => {
  const imageUrl = position.image ? `${position.image}` : null;

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
        ${isTop ? "border-blue-500" : "border-gray-200"}
      `}
    >
      {/* Left: Profile Picture */}
      <div className="flex-shrink-0 mr-4">
        <img
          src={imageUrl || user}
          alt={`${position.name}'s profile`}
          className="h-20 w-20 object-cover border-2 rounded-lg border-blue-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/128x128/cccccc/ffffff?text=No+Image";
          }}
        />
      </div>

      {/* Right: Text + Actions */}
      <div className="flex flex-col">
        <div>
          <h3 className="text-sm font-semibold">{position.name}</h3>
          <p className="text-sm bg-blue-100 text-blue-700 mt-1 rounded-md font-medium px-3 py-0.5">
            {position.position}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrgCard;
