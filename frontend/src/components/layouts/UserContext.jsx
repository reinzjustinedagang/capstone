// UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    username: "Guest",
    role: "User",
    image: null,
  });
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: me } = await axios.get(`${backendUrl}/api/user/me`, {
          withCredentials: true,
        });
        if (me.isAuthenticated) {
          const { data } = await axios.get(
            `${backendUrl}/api/user/user/${me.id}`,
            { withCredentials: true }
          );
          if (data.isAuthenticated) {
            setUser({
              username: data.username,
              role: data.role,
              image: data.image,
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
