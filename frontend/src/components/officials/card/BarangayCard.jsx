import React from "react";
import { Edit, Trash2 } from "lucide-react";
import user from "../../../assets/user.png";

const BarangayCard = ({ official, onEdit, onDelete }) => {
  return (
    <div className="relative flex flex-col items-center bg-white p-4 rounded-2xl shadow-md w-48 transition-transform transform ">
      {/* Barangay Name */}
      <h3
        className="text-sm font-semibold text-center mb-2 max-w-full truncate"
        title={official.barangay_name}
      >
        {official.barangay_name}
      </h3>

      {/* Profile Picture */}
      <div className="relative mb-3">
        <img
          src={official.image || user}
          alt={official.president_name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/80x80/cccccc/ffffff?text=No+Image";
          }}
          className="w-24 h-24 object-cover border-2 rounded-lg border-blue-500"
        />
      </div>

      {/* President Name */}
      <p
        className="text-sm font-medium text-center max-w-full truncate"
        title={official.president_name}
      >
        {official.president_name}
      </p>

      {/* Position */}
      <p className="text-sm bg-blue-100 text-blue-700 mt-1 px-3 py-0.5 rounded-md font-medium">
        {official.position}
      </p>

      {/* Action Buttons */}
      <div className="flex mt-4 gap-4">
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          aria-label={`Edit ${official.president_name}`}
        >
          <Edit className="h-5 w-5" />
        </button>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-300 transition"
          aria-label={`Delete ${official.president_name}`}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default BarangayCard;
