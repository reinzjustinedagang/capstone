import React from "react";
import { Edit, Trash2 } from "lucide-react";
import user from "../../../assets/user.png";

const BarangayCard = ({ official, onEdit, onDelete }) => {
  return (
    <div className="relative flex flex-col items-center bg-white p-3 rounded-xl shadow w-40 transition-all duration-200 hover:shadow-md ">
      {/* Status Badge */}
      <span
        className={`absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-semibold rounded-md
          ${official.approved === 0 ? "bg-yellow-500 text-white" : ""}`}
      >
        {official.approved === 0 ? "Pending" : ""}
      </span>

      {/* Barangay Name */}
      <h3
        className="text-sm font-semibold text-center mb-1 truncate max-w-[8rem] text-gray-800"
        title={official.barangay_name}
      >
        Brgy.{" "}
        {official.barangay_name.replace(/^Barangay\s+/i, "").toUpperCase()}
      </h3>

      {/* Profile Picture */}
      <div className="mb-2">
        <img
          src={official.image || user}
          alt={official.president_name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/64x64/cccccc/ffffff?text=No+Img";
          }}
          className="w-16 h-16 object-cover rounded-full border-2 border-blue-500"
        />
      </div>

      {/* President Name */}
      <p
        className="text-xs font-medium text-center text-gray-900 truncate max-w-[8rem]"
        title={official.president_name}
      >
        {official.president_name}
      </p>

      {/* Position */}
      <p className="text-xs mt-1 px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 uppercase tracking-wide">
        {official.position}
      </p>

      {/* Action Buttons */}
      <div className="flex mt-2 gap-2">
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 p-1.5 rounded-full focus:outline-none transition"
          aria-label={`Edit ${official.president_name}`}
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-white bg-red-50 hover:bg-red-600 p-1.5 rounded-full focus:outline-none transition"
          aria-label={`Delete ${official.president_name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default BarangayCard;
