import React, { useEffect } from "react";
import Layout from "../../components/layouts/Layout";
import RecycleBin from "../../components/senior-citizen/RecycleBin";

export const RecycleBinPage = () => {
  useEffect(() => {
    document.title = "Recycle bin";
  }, []);
  return <RecycleBin />;
};
