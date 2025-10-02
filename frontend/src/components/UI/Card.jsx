import React from "react";

const Card = ({ title, value, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    indigo: "bg-indigo-50 text-indigo-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full flex">
      <div className="flex items-center w-full">
        {/* Icon */}
        <div className={`p-3 rounded-full shrink-0 ${colorClasses[color]}`}>
          {icon}
        </div>

        {/* Texts */}
        <div className="ml-5 flex-1 min-w-0">
          {/* Title with truncation */}
          <p
            className="text-sm font-medium text-gray-500 truncate"
            title={title}
          >
            {title}
          </p>
          <p className="text-xl font-semibold break-words">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
