import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkAuth } from "./Auth";

const PublicOnlyRoute = ({ children }) => {
  const [authState, setAuthState] = useState({
    loading: true,
    isAuthenticated: false,
    role: null,
  });

  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      try {
        const data = await checkAuth();
        if (isMounted) setAuthState({ ...data, loading: false });
      } catch {
        if (isMounted)
          setAuthState({ loading: false, isAuthenticated: false, role: null });
      }
    };

    verifyAuth();

    // Cleanup in case component unmounts during async call
    return () => {
      isMounted = false;
    };
  }, []);

  if (authState.loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay background with blur + transparency */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

        {/* Spinner + text */}
        <div className="relative flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-700 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (authState.isAuthenticated) {
    const role = authState.role?.toLowerCase();
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (role === "staff") return <Navigate to="/staff/dashboard" replace />;
    // fallback redirect if role unknown
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
