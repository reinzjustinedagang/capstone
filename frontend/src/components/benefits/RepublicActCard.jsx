import React from "react";
import { BookOpenTextIcon, Edit, Trash2 } from "lucide-react";

const RepublicActCard = ({ law, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-gray-200 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-purple-700 flex items-center gap-2">
          <BookOpenTextIcon className="w-5 h-5 text-purple-500" />
          {law.title}
        </h2>
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
      <p className="text-sm text-gray-600 mt-1">{law.description}</p>
      <div className="text-xs text-gray-400 mt-2">
        Enacted: {new Date(law.enacted_date).toISOString().split("T")[0]}
      </div>
    </div>
  );
};

export default RepublicActCard;
