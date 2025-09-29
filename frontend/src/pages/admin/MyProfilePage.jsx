import React, { useEffect } from "react";
import Layout from "../../components/layouts/Layout";
import MyProfile from "../../components/my-profile/MyProfile";

export const MyProfilePage = () => {
  useEffect(() => {
    document.title = "My profile";
  }, []);
  return <MyProfile />;
};
