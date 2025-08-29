import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "../UI/Card";
import { NavLink } from "react-router-dom";
import {
  UsersIcon,
  MessageSquareIcon,
  BellIcon,
  UserPlusIcon,
  HouseIcon,
} from "lucide-react";

const Dashboard = () => {
  const [barangayCount, setBarangayCount] = useState(0);
  const [citizenCount, setCitizenCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchEventsCount = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/events/count/all`);
      setEventsCount(res.data.count);
    } catch (err) {
      console.error("Failed to fetch barangay count", err);
    }
  };

  const fetchUserCount = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/count/all`);
      setUserCount(res.data.count);
    } catch (err) {
      console.error("Failed to fetch barangay count", err);
    }
  };

  const fetchBarangayCount = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/barangays/count/all`);
      setBarangayCount(res.data.count);
    } catch (err) {
      console.error("Failed to fetch barangay count", err);
    }
  };

  const fetchCitizenCount = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/senior-citizens/count/all`
      );
      setCitizenCount(res.data.count);
    } catch (err) {
      console.error("Failed to fetch senior citizen count", err);
    }
  };

  useEffect(() => {
    fetchBarangayCount();
    fetchCitizenCount();
    fetchUserCount();
    fetchEventsCount();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <NavLink to="/admin/senior-citizen-list">
          <Card
            title="Total Senior Citizens"
            value={citizenCount}
            icon={<UsersIcon />}
            color="blue"
          />
        </NavLink>

        <NavLink to="/admin/barangays">
          <Card
            title="No. of Barangay"
            value={barangayCount}
            icon={<HouseIcon />}
            color="green"
          />
        </NavLink>

        <Card
          title="SMS Sent (This Month)"
          value="0"
          icon={<MessageSquareIcon />}
          color="indigo"
        />
        <Card
          title="Total Benefits"
          value="12"
          icon={<BellIcon />}
          color="amber"
        />
        <NavLink to="/admin/events">
          <Card
            title="Total Events"
            value={eventsCount}
            icon={<BellIcon />}
            color="amber"
          />
        </NavLink>
        <NavLink to="/admin/user-management">
          <Card
            title="Total User"
            value={userCount}
            icon={<BellIcon />}
            color="amber"
          />
        </NavLink>
      </div>
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Registrations</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Age
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Date Registered
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm">Maria Santos</td>
                  <td className="px-4 py-3 text-sm">67</td>
                  <td className="px-4 py-3 text-sm">Brgy. Poblacion</td>
                  <td className="px-4 py-3 text-sm">June 15, 2023</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm">Pedro Reyes</td>
                  <td className="px-4 py-3 text-sm">72</td>
                  <td className="px-4 py-3 text-sm">Brgy. Labangan</td>
                  <td className="px-4 py-3 text-sm">June 14, 2023</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm">Juan Dela Cruz</td>
                  <td className="px-4 py-3 text-sm">65</td>
                  <td className="px-4 py-3 text-sm">Brgy. San Roque</td>
                  <td className="px-4 py-3 text-sm">June 12, 2023</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm">Elena Magtanggol</td>
                  <td className="px-4 py-3 text-sm">70</td>
                  <td className="px-4 py-3 text-sm">Brgy. Pag-asa</td>
                  <td className="px-4 py-3 text-sm">June 10, 2023</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent SMS Activities</h2>
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm font-medium">
                Monthly Pension Notification
              </p>
              <p className="text-xs text-gray-500">
                Sent to 45 recipients • June 16, 2023
              </p>
            </div>
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm font-medium">Health Checkup Reminder</p>
              <p className="text-xs text-gray-500">
                Sent to 78 recipients • June 14, 2023
              </p>
            </div>
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm font-medium">
                Community Meeting Invitation
              </p>
              <p className="text-xs text-gray-500">
                Sent to 120 recipients • June 10, 2023
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">
                Medicine Distribution Notice
              </p>
              <p className="text-xs text-gray-500">
                Sent to 56 recipients • June 5, 2023
              </p>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
};
export default Dashboard;
