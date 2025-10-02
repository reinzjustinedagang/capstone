import React, { useState } from "react";
import { BookOpenTextIcon, Edit, Trash2 } from "lucide-react";
import Modal from "../UI/Modal";

const RepublicActCard = ({ law, onEdit, onDelete }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition"
        onClick={() => setShowDetailModal(true)}
      >
        {/* Image */}
        <div className="relative w-full aspect-[4/3] bg-gray-100">
          <img
            src={
              law.image_url || "https://placehold.co/600x400?text=Republic+Act"
            }
            alt={law.title}
            className="w-full h-full object-cover"
          />

          {/* Pending Badge */}
          {law.approved === 0 && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded">
              Pending
            </span>
          )}

          {/* Action buttons (same style as BenefitsCard) */}
          <div className="absolute top-2 right-2 flex gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit(law.id);
              }}
              className="bg-white/90 hover:bg-white text-blue-500 hover:text-blue-700 p-2 rounded-full shadow"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(law.id);
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
          <div className="flex items-center gap-2 mb-2">
            <BookOpenTextIcon className="w-5 h-5 text-blue-500 shrink-0" />
            <h2 className="text-base font-semibold text-gray-900 line-clamp-2">
              {law.title}
            </h2>
          </div>

          {/* Truncated Description */}
          <p
            className="text-sm text-gray-600 flex-grow"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {law.description}
          </p>

          {/* Enacted Date */}
          <div className="text-xs text-gray-400 mt-2">
            Enacted: {new Date(law.enacted_date).toISOString().split("T")[0]}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={law.title}
      >
        <div>
          {/* Full Image */}
          <img
            src={
              law.image_url || "https://placehold.co/800x500?text=Republic+Act"
            }
            alt={law.title}
            className="w-full h-auto object-cover rounded-lg mb-4"
          />

          <p className="text-gray-700 text-sm mb-4">{law.description}</p>
          <div className="text-xs text-gray-500">
            Enacted on:{" "}
            {new Date(law.enacted_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RepublicActCard;
