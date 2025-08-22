import React, { useEffect, useState } from "react";
import RegistrationBanner from "./home/RegistrationBanner";
import News from "./home/News";
import Header from "./Header";
import Slideshow from "./home/Slideshow";
import Footer from "./Footer";
import slider5 from "../../assets/slider5.jpg";

const Home = () => {
  return (
    <div
      className="min-h-screen text-gray-800 bg-no-repeat bg-cover bg-fixed"
      style={{
        backgroundImage: `url(${slider5})`,
      }}
    >
      <Header />

      <Slideshow />
      <RegistrationBanner />
      <News />
      <Footer />
    </div>
  );
};

export default Home;
