import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../../UI/Button";
import { Printer } from "lucide-react";

const PensionerRemarksReportPrint = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [pensionerData, setPensionerData] = useState({});
  const [remarksData, setRemarksData] = useState({});
  const [notedBy, setNotedBy] = useState("MSWD/OIC-OSCA HEAD");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pensionerRes, remarksRes, headRes] = await Promise.all([
          axios.get(`${backendUrl}/api/charts/pensioner`),
          axios.get(`${backendUrl}/api/charts/remarks`),
          axios
            .get(`${backendUrl}/api/officials/head`)
            .catch(() => ({ data: {} })),
        ]);

        setPensionerData(pensionerRes.data || {});
        setRemarksData(remarksRes.data || {});
        setNotedBy(headRes.data?.name || "MSWD/OIC-OSCA HEAD");
      } catch (err) {
        console.error("Error fetching report data:", err);
      }
    };
    fetchData();
  }, [backendUrl]);

  const handlePrint = () => {
    const pensionerKeys = Object.keys(pensionerData);
    const pensionerValues = Object.values(pensionerData);
    const pensionerTotal = pensionerValues.reduce((sum, val) => sum + val, 0);

    const remarksKeys = Object.keys(remarksData);
    const remarksValues = Object.values(remarksData);
    const remarksTotal = remarksValues.reduce((sum, val) => sum + val, 0);

    const printContents = `
      <div style="text-align:center; margin-bottom:20px;">
        <h3 style=" margin-bottom:5px; text-transform:uppercase;">San Jose, Occidental Mindoro</h3>
        <p style="text-align:center; margin-top: 0;">${new Date().toLocaleDateString()}</p>
      </div>

      <!-- Pensioner Table -->
      <h3 style="margin-top:20px; font-size:14px;">Pensioner Distribution</h3>
      <table style="width:100%; border-collapse: collapse; margin-top: 10px; font-size:12px;">
        <thead>
          <tr>
            <th style="border:1px solid #333; padding:8px; background:#f2f2f2;">Pensioner Type</th>
            <th style="border:1px solid #333; padding:8px; background:#f2f2f2;">Count</th>
          </tr>
        </thead>
        <tbody>
          ${pensionerKeys
            .map(
              (key, idx) => `
            <tr>
              <td style="border:1px solid #333; padding:8px;">${key}</td>
              <td style="border:1px solid #333; padding:8px; text-align:right;">${pensionerValues[idx]}</td>
            </tr>
          `
            )
            .join("")}
          <tr>
            <td style="border:1px solid #333; padding:8px; font-weight:bold;">Total</td>
            <td style="border:1px solid #333; padding:8px; font-weight:bold; text-align:right;">${pensionerTotal}</td>
          </tr>
        </tbody>
      </table>

      <!-- Remarks Table -->
      <h3 style="margin-top:30px; font-size:14px;">Remarks Distribution</h3>
      <table style="width:100%; border-collapse: collapse; margin-top: 10px; font-size:12px;">
        <thead>
          <tr>
            <th style="border:1px solid #333; padding:8px; background:#f2f2f2;">Remarks</th>
            <th style="border:1px solid #333; padding:8px; background:#f2f2f2;">Count</th>
          </tr>
        </thead>
        <tbody>
          ${remarksKeys
            .map(
              (key, idx) => `
            <tr>
              <td style="border:1px solid #333; padding:8px;">${key}</td>
              <td style="border:1px solid #333; padding:8px; text-align:right;">${remarksValues[idx]}</td>
            </tr>
          `
            )
            .join("")}
          <tr>
            <td style="border:1px solid #333; padding:8px; font-weight:bold;">Total</td>
            <td style="border:1px solid #333; padding:8px; font-weight:bold; text-align:right;">${remarksTotal}</td>
          </tr>
        </tbody>
      </table>

      <!-- Prepared by / Noted by -->
      <div style="margin-top:60px; display:flex; justify-content:space-between; width:80%; margin-left:auto; margin-right:auto;">
        <div style="text-align:center;">
          <p style="margin-bottom:60px; font-size:12px;">Prepared by:</p>
          <p style="text-decoration:underline; font-weight:bold; font-size:14px;">${user.username.toUpperCase()}</p>
          <p style="font-size:12px;">OSCA STAFF</p>
        </div>
        <div style="text-align:center;">
          <p style="margin-bottom:60px; font-size:12px;">Noted by:</p>
          <p style="text-decoration:underline; font-weight:bold; font-size:14px;">${notedBy.toUpperCase()}</p>
          <p style="font-size:12px;">MSWD/OIC-OSCA HEAD</p>
        </div>
      </div>
    `;

    const newWindow = window.open("", "", "width=900,height=700");
    newWindow.document.write(`
  <html>
    <head>
      <title>Pensioner & Remarks Report</title>
      <style>
        @page { size: A4 portrait; margin: 1cm; }
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 14px; }
        h3 { margin: 0; font-size: 16px; }
        table { font-size: 14px; }
      </style>
    </head>
    <body>${printContents}</body>
  </html>
`);

    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
  };

  return (
    <Button
      variant="primary"
      icon={<Printer className="h-4 w-4 mr-2" />}
      onClick={handlePrint}
      className="w-full sm:w-auto flex justify-center"
    >
      Print
    </Button>
  );
};

export default PensionerRemarksReportPrint;
