import React from "react";
import { SaveIcon, Loader2, KeyRound } from "lucide-react";
import Button from "../../UI/Button";

export default function ChangePasswordForm({
  currentPassword,
  newPassword,
  confirmNewPassword,
  setCurrentPassword,
  setNewPassword,
  setConfirmNewPassword,
  onSubmit,
  loading,
  username,
}) {
  return (
    <>
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <KeyRound className="h-5 w-5 mr-2 text-indigo-600" />
        Change Password
      </h3>
      <form onSubmit={onSubmit} className="space-y-6">
        <input
          type="text"
          value={username}
          readOnly
          tabIndex={-1}
          className="hidden"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              value=""
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              name="currentPassword"
              autoComplete="current-password"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
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
            {loading ? "Updating..." : "Change Password"}
          </Button>
        </div>
      </form>
    </>
  );
}
