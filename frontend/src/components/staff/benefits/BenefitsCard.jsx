import React, { useState } from "react";
import { Info, Edit, Trash2 } from "lucide-react";
import Modal from "../../UI/Modal";
import Button from "../../UI/Button";

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
          {type.image_url ? (
            <img
              src={type.image_url}
              alt={type.title || "Benefit Image"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-500">
              No Image
            </div>
          )}

          {/* Action buttons */}
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
