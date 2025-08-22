import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "../../UI/Card";
import { NavLink } from "react-router-dom";
import { UsersIcon, MessageSquareIcon, BellIcon } from "lucide-react";

const Dashboard = () => {
  const [citizenCount, setCitizenCount] = useState(0);
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

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
    fetchCitizenCount();
  }, []);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        <NavLink to="/staff/senior-citizen-list">
          <Card
            title="Total Senior Citizens"
            value={citizenCount}
            icon={<UsersIcon />}
            color="blue"
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
          value="0"
          icon={<BellIcon />}
          color="amber"
        />
      </div>
    </>
  );
};

export default Dashboard;
