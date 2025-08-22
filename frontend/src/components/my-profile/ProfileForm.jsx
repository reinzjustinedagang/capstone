import React from "react";
import { SaveIcon, Loader2, UserCircle } from "lucide-react";
import Button from "../UI/Button";

export default function ProfileForm({
  username,
  email,
  cp_number,
  setUserName,
  setEmail,
  setCpNumber,
  onSubmit,
  loading,
}) {
  return (
    <>
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UserCircle className="h-5 w-5 mr-2 text-blue-600" />
        Update Profile Information
      </h3>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <input
              type="tel"
              value={cp_number}
              onChange={(e) => setCpNumber(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </>
  );
}
