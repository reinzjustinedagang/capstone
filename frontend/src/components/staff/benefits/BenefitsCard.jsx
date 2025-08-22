import React from "react";
import { Info, MapPin, Edit, Trash2 } from "lucide-react";

const BenefitsCard = ({
  type,
  icon = <Info className="w-5 h-5 text-blue-500" />,
  textColor,
  textIcon,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-gray-200 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <h2
          className={`text-lg font-semibold ${textColor} flex items-center gap-2`}
        >
          {icon}
          {type.title}
        </h2>
      </div>

      <p className="text-sm text-gray-600 mt-1">{type.description}</p>

      <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
        <MapPin className={`w-4 h-4 ${textIcon}`} />
        {type.location}
      </div>
      <div className="text-xs text-gray-400 mt-1">
        Provided by: {type.provider}
      </div>
    </div>
  );
};

export default BenefitsCard;
