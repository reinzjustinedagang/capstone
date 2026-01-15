import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Button from "../../UI/Button";
import { Printer } from "lucide-react";
import pilipinas_logo from "../../../assets/bagong-pilipinas.png";
import sj_logo from "../../../assets/municipal-logo.png";

const BenefitRecipientsPrint = ({ benefitId }) => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notedBy, setNotedBy] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
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

  // ✅ Fetch head official
  useEffect(() => {
    const fetchHead = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/officials/head`);
        setNotedBy(res.data?.name || "");
      } catch (err) {
        console.error("Failed to fetch head official:", err);
      }
    };
    fetchHead();
  }, [backendUrl]);

  // ✅ Fetch benefit recipients
  useEffect(() => {
    if (!benefitId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${backendUrl}/api/reports/benefits/print`,
          { params: { benefitId } }
        );
        setRecipients(res.data?.recipients || []);
      } catch (err) {
        console.error("Error fetching benefit recipients:", err);
      } finally {
        setLoading(false);
      }
    };

    setPreparedBy(user?.username || "System User");
    fetchData();
  }, [backendUrl, benefitId]);

  // ✅ Print
  const handlePrint = async () => {
    if (!reportRef.current) return;

    const sjLogoBase64 = await toDataURL(sj_logo);
    const pilipinasLogoBase64 = await toDataURL(pilipinas_logo);

    const benefitTitle =
      recipients[0]?.benefit_description || "Benefit Recipients";

    const printContents = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
        <img src="${sjLogoBase64}" style="height:70px;" />
        <div style="text-align:center;">
          <h2 style="margin:0;">Republic of the Philippines</h2>
          <h3 style="margin:0;">Office for Senior Citizen Affairs</h3>
          <p style="margin:0; font-size:12px;">
            Burgos Street, San Jose 5100, Occidental Mindoro
          </p>
          <p style="margin-top:5px; font-size:12px;">
            ${new Date().toLocaleDateString()}
          </p>
        </div>
        <img src="${pilipinasLogoBase64}" style="height:70px;" />
      </div>

      <p style="text-align:center; font-weight:bold;">
        ${benefitTitle}
      </p>

      <table style="width:100%; border-collapse:collapse; margin-top:20px;">
        <thead>
          <tr>
            <th style="border:1px solid #333; padding:6px;">#</th>
            <th style="border:1px solid #333; padding:6px;">Full Name</th>
            <th style="border:1px solid #333; padding:6px;">Gender</th>
            <th style="border:1px solid #333; padding:6px;">Barangay</th>
            <th style="border:1px solid #333; padding:6px;">Received Date</th>
          </tr>
        </thead>
        <tbody>
          ${recipients
            .map(
              (r, idx) => `
            <tr>
              <td style="border:1px solid #333; padding:6px; text-align:center;">
                ${idx + 1}
              </td>
              <td style="border:1px solid #333; padding:6px;">
                ${r.lastName}, ${r.firstName} ${r.middleName || ""} ${
                r.suffix || ""
              }
              </td>
              <td style="border:1px solid #333; padding:6px; text-align:center;">
                ${r.gender}
              </td>
              <td style="border:1px solid #333; padding:6px; text-align:center;">
                ${r.barangay_name || ""}
              </td>
              <td style="border:1px solid #333; padding:6px; text-align:center;">
                ${r.received_date || ""}
              </td>
            </tr>`
            )
            .join("")}
          <tr>
            <td colspan="5" style="text-align:right; padding:6px; font-weight:bold; border:1px solid #333;">
              Total: ${recipients.length}
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top:60px; display:flex; justify-content:space-between; width:80%; margin:auto;">
        <div style="text-align:center;">
          <p style="margin-bottom:60px;">Prepared by:</p>
          <p style="text-decoration:underline; font-weight:bold;">
            ${(preparedBy || "System User").toUpperCase()}
          </p>
          <p>OSCA STAFF</p>
        </div>
        <div style="text-align:center;">
          <p style="margin-bottom:60px;">Noted by:</p>
          <p style="text-decoration:underline; font-weight:bold;">
            ${(notedBy || "Municipal Head").toUpperCase()}
          </p>
          <p>MSWD/OIC-OSCA HEAD</p>
        </div>
      </div>
    `;

    const win = window.open("", "", "width=1000,height=700");
    win.document.write(`
      <html>
        <head><title>Benefit Recipients</title></head>
        <body style="font-family:Arial; padding:20px;">
          ${printContents}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="space-y-4">
      <Button
        variant="primary"
        icon={<Printer className="h-4 w-4 mr-2" />}
        onClick={handlePrint}
        disabled={loading || !benefitId}
      >
        {loading ? "Loading..." : "Print"}
      </Button>

      <div ref={reportRef} style={{ display: "none" }} />
    </div>
  );
};

export default BenefitRecipientsPrint;
