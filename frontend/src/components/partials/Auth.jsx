import axios from "axios";

const backendUrl = import.meta.env.VITE_API_BASE_URL;

export const checkAuth = async () => {
  try {
    const res = await axios.get(`${backendUrl}/api/user/session`, {
      withCredentials: true,
    });

    const user = res.data.user;

    if (user) {
      localStorage.setItem("user", JSON.stringify(user)); // optional, if you use localStorage
      return {
        isAuthenticated: true,
        role: user.role,
      };
    } else {
      localStorage.removeItem("user");
      return {
        isAuthenticated: false,
        role: null,
      };
    }
  } catch (err) {
    // Handle unauthenticated or error case
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("user");
      return { isAuthenticated: false, role: null };
    }

    console.error("Error checking auth:", err);
    localStorage.removeItem("user"); // clean up in unexpected errors too
    return { isAuthenticated: false, role: null };
  }
};
