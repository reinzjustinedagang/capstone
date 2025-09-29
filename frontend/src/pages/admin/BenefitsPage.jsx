import React, { useEffect } from "react";
import Layout from "../../components/layouts/Layout";
import Benefits from "../../components/benefits/Benefits";

export const BenefitsPage = () => {
  useEffect(() => {
    document.title = "Benefits";
  }, []);
  return <Benefits />;
};
