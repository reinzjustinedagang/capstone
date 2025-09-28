// CitizenListPrint.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../../UI/Button";
import { Printer } from "lucide-react";

const CitizenListPrint = ({
  filters,
  fields = ["name", "gender", "barangay"],
}) => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [citizens, setCitizens] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/charts/citizens/print`, {
          params: filters, // ✅ pass filters to backend
        });
        setCitizens(res.data?.citizens || []);
      } catch (err) {
        console.error("Error fetching citizens for print:", err);
      }
    };
    fetchData();
  }, [backendUrl, filters]);

  const handlePrint = () => {
    const headers = [];
    if (fields.includes("name")) headers.push("Full Name");
    if (fields.includes("gender")) headers.push("Gender");
    if (fields.includes("barangay")) headers.push("Barangay");
    if (fields.includes("remarks")) headers.push("Remarks");

    const rows = citizens.map((c, idx) => {
      const cols = [];
      if (fields.includes("name")) {
        cols.push(
          `${c.lastName}, ${c.firstName} ${c.middleName || ""} ${
            c.suffix || ""
          }`
        );
      }
      if (fields.includes("gender")) cols.push(c.gender);
      if (fields.includes("barangay")) cols.push(c.barangay_name || "");
      if (fields.includes("remarks")) cols.push(c.form_data?.remarks || "");

      return `<tr>
        <td style="border:1px solid #333; padding:6px;">${idx + 1}</td>
        ${cols
          .map(
            (col) =>
              `<td style="border:1px solid #333; padding:6px;">${col}</td>`
          )
          .join("")}
      </tr>`;
    });

    const printContents = `
      <h2 style="text-align:center;">Senior Citizens Report</h2>
      <table style="width:100%; border-collapse: collapse; margin-top:20px;">
        <thead>
          <tr>
            <th style="border:1px solid #333; padding:6px;">#</th>
            ${headers
              .map(
                (h) =>
                  `<th style="border:1px solid #333; padding:6px;">${h}</th>`
              )
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.join("")}
          <tr>
            <td colspan="${
              headers.length + 1
            }" style="border:1px solid #333; padding:6px; font-weight:bold; text-align:right;">
              Total: ${citizens.length}
            </td>
          </tr>
        </tbody>
      </table>
    `;

    const newWindow = window.open("", "", "width=1000,height=700");
    newWindow.document.write(`
      <html>
        <head><title>Senior Citizens Report</title></head>
        <body style="font-family: Arial, sans-serif; padding:20px;">
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
      Print Senior Citizens Report
    </Button>
  );
};

export default CitizenListPrint;
