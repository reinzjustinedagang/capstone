import React from "react";
import { Edit, Trash2 } from "lucide-react";
import user from "../../../assets/user.png";

const BarangayCard = ({ official }) => {
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
    </div>
  );
};

export default BarangayCard;
