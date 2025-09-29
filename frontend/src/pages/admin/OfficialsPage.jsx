import React, { useEffect } from "react";
import Layout from "../../components/layouts/Layout";
import Officials from "../../components/officials/Officials";

export const OfficialsPage = () => {
  useEffect(() => {
    document.title = "Osca Official";
  }, []);
  return <Officials />;
};
