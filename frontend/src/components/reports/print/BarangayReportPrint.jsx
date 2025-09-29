import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Button from "../../UI/Button";
import { Printer } from "lucide-react";

const BarangayReportPrint = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [data, setData] = useState([]);
  const reportRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/charts/barangay`);
        setData(res.data || []);
      } catch (err) {
        console.error("Error fetching barangay data:", err);
      }
    };
    fetchData();
  }, [backendUrl]);

  const handlePrint = () => {
    if (!reportRef.current) return;

    // Show table only in the printable window
    const printContents = `
      <h2 style="text-align:center;">Barangay Demographic Report</h2>
      <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr>
            <th style="border:1px solid #333; padding:8px;">Barangay</th>
            <th style="border:1px solid #333; padding:8px;">Male</th>
            <th style="border:1px solid #333; padding:8px;">Female</th>
            <th style="border:1px solid #333; padding:8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (item) => `
            <tr>
              <td style="border:1px solid #333; padding:8px;">${
                item.barangay
              }</td>
              <td style="border:1px solid #333; padding:8px;">${
                item.male_count
              }</td>
              <td style="border:1px solid #333; padding:8px;">${
                item.female_count
              }</td>
              <td style="border:1px solid #333; padding:8px;">${
                item.male_count + item.female_count
              }</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    const newWindow = window.open("", "", "width=900,height=700");
    newWindow.document.write(`
      <html>
        <head>
          <title>Barangay Demographic Report</title>
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
    <>
      <Button
        variant="primary"
        icon={<Printer className="h-4 w-4 mr-2" />}
        onClick={handlePrint}
        className="w-full sm:w-auto flex justify-center"
      >
        Print
      </Button>

      {/* The table is no longer rendered in the page */}
      <div ref={reportRef} style={{ display: "none" }}></div>
    </>
  );
};

export default BarangayReportPrint;
