import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Button from "../../UI/Button";
import { Printer } from "lucide-react";

const BarangayReportPrint = () => {
  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const [data, setData] = useState([]);
  const [preparedBy, setPreparedBy] = useState("");
  const [notedBy, setNotedBy] = useState(); // you can replace or fetch this
  const reportRef = useRef();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchHead = async () => {
      try {
        const head = await axios.get(`${backendUrl}/api/officials/head`);
        setNotedBy(head.data?.name || "");
      } catch (err) {
        console.error("Failed to fetch officials:", err);
      }
    };

    fetchHead();
  }, [backendUrl]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/charts/barangay`);
        setData(res.data || []);
      } catch (err) {
        console.error("Error fetching barangay data:", err);
      }
    };

    // Example: load user info (assuming it's stored in localStorage)
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.name) {
      setPreparedBy(user.name);
    } else {
      setPreparedBy("System User");
    }

    fetchData();
  }, [backendUrl]);

  const handlePrint = () => {
    if (!reportRef.current) return;

    const totalMale = data.reduce((sum, item) => sum + item.male_count, 0);
    const totalFemale = data.reduce((sum, item) => sum + item.female_count, 0);

    const printContents = `
      <h3 style="text-align:center; margin-bottom: 5px; text-transform:uppercase;">San Jose, Occidental Mindoro</h3>
      <p style="text-align:center; margin-top: 0;">${new Date().toLocaleDateString()}</p>
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
              <td style="border:1px solid #333; padding:8px; text-align:center;">${
                item.male_count
              }</td>
              <td style="border:1px solid #333; padding:8px; text-align:center;">${
                item.female_count
              }</td>
              <td style="border:1px solid #333; padding:8px; text-align:center;">${
                item.male_count + item.female_count
              }</td>
            </tr>
          `
            )
            .join("")}
          <tr>
            <td style="border:1px solid #333; padding:8px; font-weight:bold;">TOTAL</td>
            <td style="border:1px solid #333; padding:8px; text-align:center; font-weight:bold;">${totalMale}</td>
            <td style="border:1px solid #333; padding:8px; text-align:center; font-weight:bold;">${totalFemale}</td>
            <td style="border:1px solid #333; padding:8px; text-align:center; font-weight:bold;">${
              totalMale + totalFemale
            }</td>
          </tr>
        </tbody>
      </table>

 <div style="margin-top:60px; display:flex; justify-content:space-between; width:80%; margin-left:auto; margin-right:auto;">
  <div style="text-align:center;">
    <p style="margin-bottom:60px;">Prepared by:</p>
    <p style="text-decoration:underline; font-weight:bold; text-transform:uppercase;">
      ${user.username.toUpperCase()}
    </p>
    <p>OSCA STAFF</p>
  </div>
  <div style="text-align:center;">
    <p style="margin-bottom:60px;">Noted by:</p>
    <p style="text-decoration:underline; font-weight:bold; text-transform:uppercase;">
      ${notedBy.toUpperCase()}
    </p>
    <p>MSWD/OIC-OSCA HEAD</p>
  </div>
</div>


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

      {/* Hidden content just to hold ref */}
      <div ref={reportRef} style={{ display: "none" }}></div>
    </>
  );
};

export default BarangayReportPrint;
