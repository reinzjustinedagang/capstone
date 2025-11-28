import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Button from "../../UI/Button";
import { Printer } from "lucide-react";
import pilipinas_logo from "../../../assets/bagong-pilipinas.png";
import sj_logo from "../../../assets/municipal-logo.png";

const BarangayReportPrint = () => {
  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const [data, setData] = useState([]);
  const [preparedBy, setPreparedBy] = useState("");
  const [notedBy, setNotedBy] = useState(); // you can replace or fetch this
  const reportRef = useRef();

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

  const handlePrint = async () => {
    if (!reportRef.current) return;

    const totalMale = data.reduce((sum, item) => sum + item.male_count, 0);
    const totalFemale = data.reduce((sum, item) => sum + item.female_count, 0);

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
