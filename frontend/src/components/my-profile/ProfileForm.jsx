import React, { useEffect, useState } from "react";
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Split username into first/last name on load
  useEffect(() => {
    if (username) {
      const lastSpaceIndex = username.lastIndexOf(" ");
      if (lastSpaceIndex !== -1) {
        setFirstName(username.substring(0, lastSpaceIndex));
        setLastName(username.substring(lastSpaceIndex + 1));
      } else {
        setFirstName(username);
        setLastName("");
      }
    }
  }, [username]);

  // Whenever first or last name changes, update the combined username
  useEffect(() => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    setUserName(fullName);
  }, [firstName, lastName, setUserName]);

  return (
    <>
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <UserCircle className="h-5 w-5 mr-2 text-blue-600" />
        Update Profile Information
      </h3>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Email */}
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

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <input
              type="tel"
              value={cp_number}
              onChange={(e) => setCpNumber(e.target.value)}
              required
              maxLength={11}
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
