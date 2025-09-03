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
                <p className="text-xs text-gray-500 capitalize">{p.type}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="p-2 rounded-md text-xs font-medium bg-white hover:bg-blue-300 text-blue-600 border border-blue-300 hover:border-blue-300 transition-colors duration-200"
                  title="Edit position"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 rounded-md text-xs font-medium bg-white hover:bg-red-300 text-red-600 border border-red-300 hover:border-red-300 transition-colors duration-200"
                  title="Delete position"
                >
                  <Trash2 className="w-4 h-4" />
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
