import React, { useState } from "react";
import { Info, Edit, Trash2 } from "lucide-react";
import Modal from "../UI/Modal";

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
      {/* Card */}
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition"
        onClick={() => setShowDetailModal(true)}
      >
        {/* Image */}
        <div className="relative w-full aspect-[4/3] bg-gray-100">
          <img
            src={type.image_url || "https://placehold.co/600x400?text=Benefits"}
            alt={type.title}
            className="w-full h-full object-cover"
          />

          {/* Pending Badge */}
          {type.approved === 0 && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded">
              Pending
            </span>
          )}

          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent opening modal
                onEdit && onEdit(type.id);
              }}
              className="bg-white/90 hover:bg-white text-blue-500 hover:text-blue-700 p-2 rounded-full shadow"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent opening modal
                onDelete && onDelete(type.id);
              }}
              className="bg-white/90 hover:bg-white text-red-500 hover:text-red-700 p-2 rounded-full shadow"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-base font-semibold text-gray-900 mb-2 truncate">
            {type.title}
          </h3>
          <p
            className={`text-sm flex items-center gap-2 ${textColor}`}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {icon} {type.description}
          </p>
          {type.provider && (
            <div className="text-xs text-gray-400 mt-1">
              Provided by: {type.provider}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
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
              className="w-full h-64 object-cover rounded-lg mb-4"
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
