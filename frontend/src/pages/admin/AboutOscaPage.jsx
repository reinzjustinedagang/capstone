import React, { useEffect } from "react";
import Layout from "../../components/layouts/Layout";
import AboutOSCA from "../../components/about/AboutOSCA";

export const AboutOscaPage = () => {
  useEffect(() => {
    document.title = "About OSCA";
  }, []);
  return <AboutOSCA />;
};
