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

const SecurityTab = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(60); // minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSecuritySave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Simulate API call to save security settings
      // const response = await axios.post('/api/settings/security', { twoFactorEnabled, sessionTimeout });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const isSuccess = true;
      if (isSuccess) {
        setSuccessMessage("Security settings updated successfully!");
      } else {
        setError("Failed to update security settings.");
      }
    } catch (err) {
      console.error("Security settings update error:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred during security settings update."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSecuritySave} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="twoFactor"
            className="block text-sm font-medium text-gray-700"
          >
            Enforce 2-Factor Authentication
          </label>
          <select
            id="twoFactor"
            value={twoFactorEnabled}
            onChange={(e) => setTwoFactorEnabled(e.target.value === "true")}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value={true}>Enabled</option>
            <option value={false}>Disabled</option>
          </select>
          <p className="mt-2 text-xs text-gray-500">
            Requires all users to set up 2FA for enhanced security.
          </p>
        </div>
        <div>
          <label
            htmlFor="sessionTimeout"
            className="block text-sm font-medium text-gray-700"
          >
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            id="sessionTimeout"
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
            min="10"
            max="1440" // 24 hours
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <p className="mt-2 text-xs text-gray-500">
            Automatically logs out inactive users after this period.
          </p>
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
          {loading ? "Saving..." : "Save Security Settings"}
        </Button>
      </div>
    </form>
  );
};

export default SecurityTab;
