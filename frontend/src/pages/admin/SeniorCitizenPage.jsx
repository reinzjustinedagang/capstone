import React, { useEffect } from "react";
import Layout from "../../components/layouts/Layout";
import SeniorCitizen from "../../components/senior-citizen/SeniorCitizen";

export const SeniorCitizenPage = () => {
  useEffect(() => {
    document.title = "Senior Citizen";
  }, []);
  return <SeniorCitizen />;
};
