import React, { useState } from "react";
import { BookOpenTextIcon } from "lucide-react";
import Modal from "../../UI/Modal";

const RepublicActCard = ({ law, onEdit, onDelete }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl shadow p-4 border border-gray-200 hover:shadow-lg transition flex flex-col relative">
        {/* Pending Badge */}
        {law.approved === 0 && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            Pending
          </span>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpenTextIcon className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-purple-gray line-clamp-2">
              {law.title}
            </h2>
          </div>
        </div>

        {/* Truncated Description */}
        <p
          onClick={() => setShowDetailModal(true)}
          className="text-sm text-gray-600 mt-2 cursor-pointer"
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

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={law.title}
      >
        <div>
          {law.approved === 0 && (
            <div className="mb-3 text-sm font-semibold text-yellow-600">
              ⚠ This Republic Act is still pending approval
            </div>
          )}
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
