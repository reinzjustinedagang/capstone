import React from "react";

const RecentSmsActivities = ({ activities = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Recent SMS Activities</h2>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((sms, idx) => (
            <div
              key={idx}
              className={`pb-3 ${
                idx < activities.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <p className="text-sm font-medium">{sms.title}</p>
              <p className="text-xs text-gray-500">
                Sent to {sms.recipients} recipients • {sms.date}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No recent SMS activities</p>
        )}
      </div>
    </div>
  );
};

export default RecentSmsActivities;
