import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "../UI/Card";
import { NavLink, useLocation } from "react-router-dom";
import {
  UsersIcon,
  MessageSquareIcon,
  BellIcon,
  UserPlusIcon,
  HouseIcon,
  GiftIcon,
  Calendar,
  User,
  UserRoundPlus,
  UserRoundCheck,
  UserRound,
  UserRoundX,
} from "lucide-react";
import BarangayDistribution from "../reports/chart/BarangayDistribution";
import RecentRegistrations from "./RecentRegistrations";
import RecentSmsActivities from "./RecentSmsActivities";

const Dashboard = () => {
  const [barangayCount, setBarangayCount] = useState(0);
  const [smsCount, setSmsCount] = useState(0);
  const [citizenCount, setCitizenCount] = useState(0);
  const [registerCount, setRegisterCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [benefitsCount, setBenefitsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const location = useLocation();
  const [showLoginNotification, setShowLoginNotification] = useState(false);

  useEffect(() => {
    if (location.state?.loginSuccess) {
      setShowLoginNotification(true);

      // Auto hide after 3 seconds
      const timer = setTimeout(() => setShowLoginNotification(false), 3000);

      // Clear state so it doesn’t persist on refresh
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const fetchEventsCount = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/events/count/all`, {
        withCredentials: true,
      });
      setEventsCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch barangay count", err);
    }
  };

  const fetchUserCount = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/count/all`);
      setUserCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch barangay count", err);
    }
  };

  const fetchBarangayCount = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/barangays/count/all`);
      setBarangayCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch barangay count", err);
    }
  };

  const fetchCitizenCount = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/senior-citizens/count/all`
      );
      setCitizenCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch senior citizen count", err);
    }
  };

  const fetchRegisterCount = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/senior-citizens/register/all`
      );
      setRegisterCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch senior citizen count", err);
    }
  };

  const fetchBenefitsCount = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/benefits/count/all`, {
        withCredentials: true,
      });
      setBenefitsCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch senior citizen count", err);
    }
  };

  const fetchSmsCount = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/sms/count`, {
        withCredentials: true,
      });
      setSmsCount(res.data.success_count || 0); // only successful sent
    } catch (err) {
      console.error("Failed to fetch SMS count", err);
    }
  };

  useEffect(() => {
    const fetchAllCounts = async () => {
      setLoading(true);
      await Promise.all([
        fetchBarangayCount(),
        fetchCitizenCount(),
        fetchUserCount(),
        fetchEventsCount(),
        fetchBenefitsCount(),
        fetchRegisterCount(),
        fetchSmsCount(),
      ]);
      setLoading(false);
    };
    fetchAllCounts();
  }, []);

  return (
    <>
      {showLoginNotification && (
        <div className="mb-4 p-3 rounded-lg bg-green-100 border border-green-400 text-green-700">
          ✅ Login successful! Welcome back.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <NavLink to="/admin/senior-citizen-list">
          <Card
            title="Total Registered Senior Citizens"
            value={loading ? "—" : citizenCount}
            icon={<UserRoundCheck />}
            color="blue"
          />
        </NavLink>
        {/* <NavLink to="/admin/senior-citizen-list">
          <Card
            title="Not Registered Senior Citizens"
            value={loading ? "—" : registerCount}
            icon={<UserRoundX />}
            color="blue"
          />
        </NavLink> */}

        <NavLink to="/admin/barangays">
          <Card
            title="No. of Barangay"
            value={loading ? "—" : barangayCount}
            icon={<HouseIcon />}
            color="blue"
          />
        </NavLink>
        <NavLink to="/admin/sms-management">
          <Card
            title="SMS Sent (This Month)"
            value={loading ? "—" : smsCount}
            icon={<MessageSquareIcon />}
            color="blue"
          />
        </NavLink>
        <NavLink to="/admin/benefits">
          <Card
            title="Total Benefits"
            value={loading ? "—" : benefitsCount}
            icon={<GiftIcon />}
            color="blue"
          />
        </NavLink>
        <NavLink to="/admin/events">
          <Card
            title="Total Events"
            value={loading ? "—" : eventsCount}
            icon={<Calendar />}
            color="blue"
          />
        </NavLink>
        <NavLink to="/admin/user-management">
          <Card
            title="Total User"
            value={loading ? "—" : userCount}
            icon={<UserRound />}
            color="blue"
          />
        </NavLink>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RecentRegistrations />

        <RecentSmsActivities
          activities={[
            {
              title: "Monthly Pension Notification",
              recipients: 45,
              date: "June 16, 2023",
            },
            {
              title: "Health Checkup Reminder",
              recipients: 78,
              date: "June 14, 2023",
            },
            {
              title: "Community Meeting Invitation",
              recipients: 120,
              date: "June 10, 2023",
            },
            {
              title: "Medicine Distribution Notice",
              recipients: 56,
              date: "June 5, 2023",
            },
          ]}
        />
      </div>
      <div>
        <BarangayDistribution />
      </div>
    </>
  );
};
export default Dashboard;
