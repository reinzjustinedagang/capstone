import React, { useState } from "react";
import { BookOpenTextIcon, Edit, Trash2 } from "lucide-react";
import Modal from "../../UI/Modal";
import Button from "../../UI/Button";

const RepublicActCard = ({ law, onEdit, onDelete }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl shadow p-4 border border-gray-200 hover:shadow-lg transition flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-purple-700 flex items-center gap-2">
            <BookOpenTextIcon className="w-5 h-5 text-blue-500" />
            {law.title}
          </h2>
        </div>

        {/* Truncated Description */}
        <p
          onClick={() => setShowDetailModal(true)}
          className="text-sm text-gray-600 mt-1 cursor-pointer"
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
