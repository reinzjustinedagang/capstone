import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "../UI/Card";
import { NavLink, useLocation } from "react-router-dom";
import {
  MessageSquareIcon,
  HouseIcon,
  GiftIcon,
  Calendar,
  UserRoundCheck,
  UserRound,
  SquareUser,
  ShieldUser,
  Network,
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

  // Officials count (from backend)
  const [officials, setOfficials] = useState({
    municipal: 0,
    barangay: 0,
    orgChart: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const location = useLocation();
  const [showLoginNotification, setShowLoginNotification] = useState(false);

  useEffect(() => {
    if (location.state?.loginSuccess) {
      setShowLoginNotification(true);
      const timer = setTimeout(() => setShowLoginNotification(false), 3000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location]);

  // Existing count fetchers...
  const fetchEventsCount = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/events/count/all`, {
        withCredentials: true,
      });
      setEventsCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch events count", err);
    }
  };

  const fetchUserCount = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/count/all`);
      setUserCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch user count", err);
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
      console.error("Failed to fetch senior citizen register count", err);
    }
  };

  const fetchBenefitsCount = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/benefits/count/all`, {
        withCredentials: true,
      });
      setBenefitsCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch benefits count", err);
    }
  };

  const fetchSmsCount = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/sms/count`, {
        withCredentials: true,
      });
      setSmsCount(res.data.success_count || 0);
    } catch (err) {
      console.error("Failed to fetch SMS count", err);
    }
  };

  // 🔹 NEW: fetch officials count
  const fetchOfficialsCount = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/officials/count`, {
        withCredentials: true,
      });
      setOfficials(
        res.data || { municipal: 0, barangay: 0, orgChart: 0, total: 0 }
      );
    } catch (err) {
      console.error("Failed to fetch officials count", err);
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
        fetchOfficialsCount(), // include officials
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 md:mt-0 mb-4">
        <NavLink to="/admin/senior-citizen-list">
          <Card
            title="Total Registered Senior Citizens"
            value={loading ? "—" : citizenCount}
            icon={<UserRoundCheck />}
            color="blue"
          />
        </NavLink>

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

        {/* Officials from backend */}
        <NavLink to="/admin/osca-officials">
          <Card
            title="Barangay Association President"
            value={loading ? "—" : officials.barangay}
            icon={<SquareUser />}
            color="blue"
          />
        </NavLink>

        <NavLink to="/admin/osca-officials">
          <Card
            title="Federation Officer"
            value={loading ? "—" : officials.municipal}
            icon={<ShieldUser />}
            color="blue"
          />
        </NavLink>

        <NavLink to="/admin/osca-officials">
          <Card
            title="Organizational Chart"
            value={loading ? "—" : officials.orgChart}
            icon={<Network />}
            color="blue"
          />
        </NavLink>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <RecentRegistrations />
        <RecentSmsActivities />
      </div>

      <div>
        <BarangayDistribution />
      </div>
    </>
  );
};
export default Dashboard;
