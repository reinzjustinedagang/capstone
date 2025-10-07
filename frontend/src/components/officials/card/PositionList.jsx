import React from "react";
import { Trash2, Edit } from "lucide-react";

const PositionList = ({ title, list, handleEdit, handleDelete }) => {
  return (
    <div className="mb-6">
      <h4 className="text-md font-semibold mb-2">{title}</h4>
      {list.length === 0 ? (
        <p className="text-sm text-gray-500">No positions yet.</p>
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg shadow-sm p-4"
            >
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  {p.name}
                </h4>
                <span className="text-xs text-gray-700 capitalize bg-gray-100 px-2 py-0.5 rounded font-medium">
                  {p.type}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="text-blue-600 hover:text-blue-900"
                  title="Edit position"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete position"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PositionList;
