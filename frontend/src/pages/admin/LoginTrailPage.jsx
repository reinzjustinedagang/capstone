import LoginTrail from "../../components/userManagement/LoginTrail";
import Layout from "../../components/layouts/Layout";
import { useEffect } from "react";

export const LoginTrailPage = () => {
  useEffect(() => {
    document.title = "Log trail";
  }, []);
  return <LoginTrail />;
};
