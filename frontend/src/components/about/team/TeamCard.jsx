import React from "react";
import { Edit, Trash2 } from "lucide-react";
import user from "../../../assets/user.png";

const TeamCard = ({ member, onEdit, onDelete }) => {
  return (
    <div className="relative flex flex-col items-center bg-white p-4 rounded-2xl shadow-md w-48 transition-all duration-200 ">
      {/* Status Badge (optional) */}
      {member.status && (
        <span
          className={`absolute top-2 left-2 px-2 py-0.5 text-[11px] font-semibold rounded-md
            ${
              member.status === "Pending"
                ? "bg-yellow-500 text-white"
                : "bg-green-500 text-white"
            }`}
        >
          {member.status}
        </span>
      )}
      {/* Profile Picture */}
      <div className="mb-3">
        <img
          src={member.image || user}
          alt={member.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/80x80/cccccc/ffffff?text=No+Img";
          }}
          className="w-24 h-24 object-cover rounded-full border-2 border-blue-500"
        />
      </div>

      {/* Member Name */}
      <h3
        className="text-sm font-semibold text-center mb-2 truncate max-w-[10rem] text-gray-800"
        title={member.name}
      >
        {member.name}
      </h3>
      {/* Role / Position */}
      <p className="text-[11px] mt-1 px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-700 uppercase tracking-wide text-center truncate">
        {member.role}
      </p>
      {/* Action Buttons */}
      <div className="flex mt-3 gap-3">
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 p-2 rounded-full focus:outline-none transition"
          aria-label={`Edit ${member.name}`}
        >
          <Edit className="h-5 w-5" />
        </button>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-white bg-red-50 hover:bg-red-600 p-2 rounded-full focus:outline-none transition"
          aria-label={`Delete ${member.name}`}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default TeamCard;
