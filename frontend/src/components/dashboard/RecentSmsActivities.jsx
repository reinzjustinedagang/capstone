import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

const RecentSmsActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchRecentSMS = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/sms/recent`);
        const logsArray = Array.isArray(response.data.logs)
          ? response.data.logs
          : response.data;

        const formattedLogs = logsArray.map((sms) => {
          let recipientCount = 0;

          try {
            recipientCount = Array.isArray(sms.recipients)
              ? sms.recipients.length
              : JSON.parse(sms.recipients).length;
          } catch {
            recipientCount = 0;
          }

          // Truncate message to 50 characters
          const truncatedMessage =
            sms.message && sms.message.length > 50
              ? sms.message.substring(0, 50) + "..."
              : sms.message || "No message";

          return {
            id: sms.id,
            title: truncatedMessage,
            recipients: recipientCount,
            date: sms.created_at
              ? new Date(sms.created_at).toLocaleString()
              : "N/A",
            status: sms.status || "Unknown",
          };
        });

        setActivities(formattedLogs);
      } catch (error) {
        console.error("Error fetching recent SMS activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSMS();
  }, [backendUrl]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Recent SMS Activities</h2>
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-start">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : activities.length > 0 ? (
          activities.map((sms, idx) => (
            <div
              key={sms.id}
              className={`pb-3 ${
                idx < activities.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <p className="text-sm font-medium">{sms.title}</p>
              <p className="text-xs text-gray-500">
                Sent to {sms.recipients} recipient
                {sms.recipients !== 1 ? "s" : ""} • {sms.date}
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
