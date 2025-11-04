import React from "react";
import { Trash2, Edit, Layers } from "lucide-react";

const PositionList = ({ title, list, handleEdit, handleDelete }) => {
  return (
    <div className="mb-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-gray-600" />
              {title}
            </h4>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {list.length} position{list.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* List */}
        <div className="p-4">
          {list.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No positions yet.</p>
          ) : (
            <div className="space-y-3">
              {list.map((p, index) => (
                <div
                  key={p.id}
                  className="group relative bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg p-4 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="text-sm font-semibold text-gray-900 truncate">
                              {p.name}
                            </h5>
                            {/* <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                              {p.type}
                            </span> */}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PositionList;
