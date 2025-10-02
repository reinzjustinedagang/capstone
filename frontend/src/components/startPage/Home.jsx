import React, { useEffect, useState } from "react";
import RegistrationBanner from "./home/RegistrationBanner";
import Events from "./home/Events";
import Header from "./layout/Header";
import Slideshow from "./home/Slideshow";
import Footer from "./layout/Footer";
import slider5 from "../../assets/slider5.jpg";
import Benefits from "./home/Benefits";
import RepublicActs from "./home/RepublicActs";

const Home = () => {
  return (
    <div>
      {/* Background animation elements - consistent with other auth pages */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-64 h-64 bg-pink-300 ... right-1/4 transform -translate-y-1/2"></div>
      </div>

      <Slideshow />
      <RegistrationBanner />
      <RepublicActs />
      <Benefits />
      <Events />
    </div>
  );
};

export default Home;
