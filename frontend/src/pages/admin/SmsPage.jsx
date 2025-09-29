import React, { useEffect } from "react";
import Layout from "../../components/layouts/Layout";
import Sms from "../../components/sms/Sms";

export const SmsPage = () => {
  useEffect(() => {
    document.title = "Sms Management";
  }, []);
  return <Sms />;
};
