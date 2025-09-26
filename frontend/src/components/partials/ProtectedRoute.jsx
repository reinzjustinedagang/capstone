import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkAuth } from "./Auth"; // Make sure this sends a proper cookie/session request

const ProtectedRoute = ({ role, children }) => {
  const [authState, setAuthState] = useState({
    loading: true,
    isAuthenticated: false,
    role: null,
  });

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const data = await checkAuth(); // Should return { isAuthenticated, role }
        setAuthState({ ...data, loading: false });
      } catch (err) {
        console.error("Auth check failed:", err);
        setAuthState({ loading: false, isAuthenticated: false, role: null });
      }
    };

    fetchAuth();
  }, []);

  // ✅ Show loading spinner or fallback
  if (authState.loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-3">
          {/* Subtle spinner */}
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

          {/* Animated text */}
          <p className="text-gray-700 text-lg font-medium animate-pulse">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Not authenticated
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Authenticated but wrong role
  if (authState.role?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Authorized
  return children;
};

export default ProtectedRoute;
