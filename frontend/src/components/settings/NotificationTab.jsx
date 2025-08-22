import { useState } from "react";
import {
  SaveIcon,
  User,
  MessageSquare,
  Settings as SettingsIconLucide, // Renamed to avoid conflict with component name
  ShieldCheck,
  BellRing,
  Loader2,
  TestTube, // For Test SMS Connection
  HardDrive, // For Manual Backup
  CheckCircle, // For success messages
  XCircle, // For error messages
} from "lucide-react";
import Button from "../UI/Button";

const NotificationTab = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [newRegistrationAlert, setNewRegistrationAlert] = useState(true);
  const [pensionDistributionAlert, setPensionDistributionAlert] =
    useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleNotificationSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Simulate API call to save notification settings
      // const response = await axios.post('/api/settings/notifications', { emailNotifications, smsAlerts, newRegistrationAlert, pensionDistributionAlert });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const isSuccess = true;
      if (isSuccess) {
        setSuccessMessage("Notification settings updated successfully!");
      } else {
        setError("Failed to update notification settings.");
      }
    } catch (err) {
      console.error("Notification settings update error:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred during notification settings update."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleNotificationSave} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="emailNotifications"
            className="block text-sm font-medium text-gray-700"
          >
            Email Notifications
          </label>
          <select
            id="emailNotifications"
            value={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.value === "true")}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value={true}>Receive all email notifications</option>
            <option value={false}>Disable all email notifications</option>
          </select>
          <p className="mt-2 text-xs text-gray-500">
            Control system-generated email alerts.
          </p>
        </div>
        <div>
          <label
            htmlFor="smsAlerts"
            className="block text-sm font-medium text-gray-700"
          >
            Critical SMS Alerts
          </label>
          <select
            id="smsAlerts"
            value={smsAlerts}
            onChange={(e) => setSmsAlerts(e.target.value === "true")}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value={true}>Receive critical SMS alerts</option>
            <option value={false}>Do not receive SMS alerts</option>
          </select>
          <p className="mt-2 text-xs text-gray-500">
            For urgent system issues or critical updates.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">
          Specific Alerts:
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="newRegistrationAlert"
              type="checkbox"
              checked={newRegistrationAlert}
              onChange={(e) => setNewRegistrationAlert(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="newRegistrationAlert"
              className="ml-2 block text-sm text-gray-900"
            >
              Alert on New Senior Citizen Registration
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="pensionDistributionAlert"
              type="checkbox"
              checked={pensionDistributionAlert}
              onChange={(e) => setPensionDistributionAlert(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="pensionDistributionAlert"
              className="ml-2 block text-sm text-gray-900"
            >
              Alert on Pension Distribution Events
            </label>
          </div>
          {/* Add more specific alert checkboxes as needed */}
        </div>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center"
          role="alert"
        >
          <XCircle className="h-5 w-5 mr-2" />
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center"
          role="alert"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          icon={
            loading ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <SaveIcon className="h-4 w-4 mr-2" />
            )
          }
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Notification Settings"}
        </Button>
      </div>
    </form>
  );
};

export default NotificationTab;
