import React, { useEffect } from "react";
import Home from "../../components/startPage/Home";
import SeniorRegisterGuide from "../../components/startPage/register/SeniorRegisterGuide";
import Header from "../../components/startPage/Header";
import Footer from "../../components/startPage/Footer";

export const GuidePage = () => {
  return (
    <div>
      <Header />
      <SeniorRegisterGuide />
      <Footer />
    </div>
  );
};
