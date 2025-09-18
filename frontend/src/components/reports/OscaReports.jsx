import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Loader2 } from "lucide-react";
import "./chart/chartConfig"; // make sure Chart.js is configured
import DeceasedReportsChart from "./chart/DeceasedReportsChart";
import TransfereeReportsChart from "./chart/TransfereeReportsChart";

const OscaReportsChart = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TransfereeReportsChart />
      <DeceasedReportsChart />
    </div>
  );
};

export default OscaReportsChart;
