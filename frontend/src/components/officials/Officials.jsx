import React, { useEffect, useState } from "react";
import axios from "axios";
import MunicipalOfficials from "./MunicipalOfficials";
import BarangayOfficials from "./BarangayOfficials";

const Officials = () => {
  return (
    <>
      <BarangayOfficials title="Barangay Association Presidents" />
      <MunicipalOfficials title="Federation Officer" />
    </>
  );
};

export default Officials;
