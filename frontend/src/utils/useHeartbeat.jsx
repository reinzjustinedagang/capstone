import { useEffect } from "react";
import axios from "axios";

const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const useHeartbeat = () => {
  useEffect(() => {
    const ping = async () => {
      try {
        await axios.post(
          `${backendUrl}/api/user/ping`,
          {},
          { withCredentials: true }
        );
      } catch (err) {
        console.error("Ping failed:", err);
      }
    };

    // Ping immediately, then every 60s
    ping();
    const interval = setInterval(ping, 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};

export default useHeartbeat;
