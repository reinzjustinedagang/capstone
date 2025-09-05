import React, { useEffect, useState } from "react";
import RegistrationBanner from "./home/RegistrationBanner";
import Events from "./home/Events";
import Header from "./Header";
import Slideshow from "./home/Slideshow";
import Footer from "./Footer";
import slider5 from "../../assets/slider5.jpg";
import Benefits from "./home/Benefits";

const Home = () => {
  return (
    <div>
      <Header />

      <Slideshow />
      <RegistrationBanner />
      <Benefits />
      <Events />
      <Footer />
    </div>
  );
};

export default Home;
