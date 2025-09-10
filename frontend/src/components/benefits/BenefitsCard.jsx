import React from "react";
import { Info, Edit, Trash2 } from "lucide-react";

const BenefitsCard = ({
  type,
  icon = <Info className="w-5 h-5 text-blue-500" />,
  textColor = "text-blue-700",
  textIcon = "text-blue-500",
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-gray-200 hover:shadow-lg transition">
      {/* Action buttons */}
      <div className="flex items-center justify-end mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit && onEdit(type.id)}
            className="text-blue-500 hover:text-blue-700 transition"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete && onDelete(type.id)}
            className="text-red-500 hover:text-red-700 transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image */}
      {type.image_url ? (
        <img
          src={type.image_url}
          alt={type.title || "Benefit Image"}
          className="w-full h-32 object-cover rounded-lg mb-2"
        />
      ) : null}

      {/* Description */}
      <p className={`text-sm font-medium flex items-center gap-2 ${textColor}`}>
        {icon} {type.description}
      </p>

      {/* Provider */}
      {type.provider && (
        <div className="text-xs text-gray-400 mt-1">
          Provided by: {type.provider}
        </div>
      )}
    </div>
  );
};

export default BenefitsCard;
