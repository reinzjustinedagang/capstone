import React, { useEffect } from "react";
import Login from "../../components/startPage/Login";
import Header from "../../components/startPage/Header";
import Footer from "../../components/startPage/Footer";

export const LoginPage = () => {
  return (
    <div>
      <Header />
      <Login />
      <Footer />
    </div>
  );
};
