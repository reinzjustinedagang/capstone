import React, { useState } from "react";
import { BookOpenTextIcon, Edit, Trash2 } from "lucide-react";
import Modal from "../UI/Modal"; // reuse your modal

const RepublicActCard = ({ law, onEdit, onDelete }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);

  return (
    <>
      <div className="relative bg-white rounded-2xl shadow border border-gray-200 hover:shadow-lg transition flex flex-col overflow-hidden">
        {/* Pending Badge */}
        {law.approved === 0 && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-xl z-10">
            Pending
          </span>
        )}

        {/* Image */}
        <div className="relative w-full aspect-[4/3] bg-gray-100">
          <img
            src={
              law.image_url || "https://placehold.co/600x400?text=Republic+Act"
            }
            alt={law.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpenTextIcon className="w-5 h-5 text-blue-500 shrink-0" />
              <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">
                {law.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit && onEdit(law.id)}
                className="text-blue-500 hover:text-blue-700 transition"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete && onDelete(law.id)}
                className="text-red-500 hover:text-red-700 transition"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Truncated Description */}
          <p
            onClick={() => setShowDetailModal(true)}
            className="text-sm text-gray-600 cursor-pointer flex-grow"
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
          <div className="text-xs text-gray-400 mt-3">
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
