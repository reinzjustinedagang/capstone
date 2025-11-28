import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../../UI/Button";
import { Printer } from "lucide-react";
import pilipinas_logo from "../../../assets/bagong-pilipinas.png";
import sj_logo from "../../../assets/municipal-logo.png";

const PensionerRemarksReportPrint = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [pensionerData, setPensionerData] = useState({});
  const [remarksData, setRemarksData] = useState({});
  const [notedBy, setNotedBy] = useState("MSWD/OIC-OSCA HEAD");
  const user = JSON.parse(localStorage.getItem("user"));

  const toDataURL = (url) =>
    fetch(url)
      .then((response) => response.blob())
      .then(
        (blob) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          })
      );

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

  const handlePrint = async () => {
    const pensionerKeys = Object.keys(pensionerData);
    const pensionerValues = Object.values(pensionerData);
    const pensionerTotal = pensionerValues.reduce((sum, val) => sum + val, 0);

    const remarksKeys = Object.keys(remarksData);
    const remarksValues = Object.values(remarksData);
    const remarksTotal = remarksValues.reduce((sum, val) => sum + val, 0);

    const sjLogoBase64 = await toDataURL(sj_logo);
    const pilipinasLogoBase64 = await toDataURL(pilipinas_logo);

    const printContents = `
  <!-- Header with Logos -->
  <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
    
    <img src="${sjLogoBase64}" alt="SJ Logo" style="height:70px; width:auto;" />
    <div style="text-align:center; line-height:1.2;">
      <h2 style="margin:0; font-size:18px; font-weight:bold;">Republic of the Philippines</h2>
      <h3 style="margin:0; font-size:16px; font-weight:bold;">Office for Senior Citizen Affairs</h3>
      <p style="margin:0; font-size:12px;">Burgos Street, San Jose 5100, Occidental Mindoro</p>
      <p style="margin-top:5px; font-size:12px;">${new Date().toLocaleDateString()}</p>
    </div>

    <img src="${pilipinasLogoBase64}" alt="Pilipinas Logo" style="height:70px; width:auto;" />
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
