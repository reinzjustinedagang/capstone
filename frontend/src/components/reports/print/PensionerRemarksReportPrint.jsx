import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../../UI/Button";
import { Printer } from "lucide-react";

const PensionerRemarksReportPrint = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [pensionerData, setPensionerData] = useState({});
  const [remarksData, setRemarksData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pensionerRes, remarksRes] = await Promise.all([
          axios.get(`${backendUrl}/api/charts/pensioner`),
          axios.get(`${backendUrl}/api/charts/remarks`),
        ]);

        setPensionerData(pensionerRes.data || {});
        setRemarksData(remarksRes.data || {});
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
      <h2 style="text-align:center;">Pensioner & Remarks Report</h2>

      <!-- Pensioner Table -->
      <h3 style="margin-top:20px;">Pensioner Distribution</h3>
      <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="border:1px solid #333; padding:8px;">Pensioner Type</th>
            <th style="border:1px solid #333; padding:8px;">Count</th>
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
      <h3 style="margin-top:30px;">Remarks Distribution</h3>
      <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="border:1px solid #333; padding:8px;">Remarks</th>
            <th style="border:1px solid #333; padding:8px;">Count</th>
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
    `;

    const newWindow = window.open("", "", "width=900,height=700");
    newWindow.document.write(`
      <html>
        <head>
          <title>Pensioner & Remarks Report</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          ${printContents}
        </body>
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
