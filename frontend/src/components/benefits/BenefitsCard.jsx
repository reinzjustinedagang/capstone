import React, { useState } from "react";
import { Info, Edit, Trash2 } from "lucide-react";
import Modal from "../UI/Modal"; // reuse your modal

const BenefitsCard = ({
  type,
  icon = <Info className="w-5 h-5 text-blue-500" />,
  textColor = "text-blue-700",
  onEdit,
  onDelete,
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl shadow p-4 border border-gray-200 hover:shadow-lg transition flex flex-col">
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
        {type.image_url && (
          <img
            src={type.image_url}
            alt={type.title || "Benefit Image"}
            className="w-full h-32 object-cover rounded-lg mb-2"
          />
        )}

        {/* Description (clickable to expand) */}
        <p
          onClick={() => setShowDetailModal(true)}
          className={`text-sm font-medium flex items-center gap-2 cursor-pointer ${textColor}`}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {icon} {type.description}
        </p>

        {/* Provider */}
        {type.provider && (
          <div className="text-xs text-gray-400 mt-1">
            Provided by: {type.provider}
          </div>
        )}
      </div>

      {/* Detail Modal for full description */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={type.title || "Benefit Details"}
      >
        <div>
          {type.image_url && (
            <img
              src={type.image_url}
              alt={type.title || "Benefit Image"}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          <p className="text-gray-700 text-sm mb-2">{type.description}</p>
          {type.provider && (
            <p className="text-xs text-gray-500">
              Provided by: {type.provider}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
};

export default BenefitsCard;
