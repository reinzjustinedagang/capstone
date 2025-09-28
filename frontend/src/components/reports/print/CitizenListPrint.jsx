import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../../UI/Button";
import { Printer } from "lucide-react";

const CitizenListPrint = ({ filters }) => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [citizens, setCitizens] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Call a backend endpoint that ignores pagination (create if not existing)
        const res = await axios.get(`${backendUrl}/api/charts/citizens/print`, {
          params: filters,
        });
        setCitizens(res.data?.citizens || []);
      } catch (err) {
        console.error("Error fetching citizens for print:", err);
      }
    };
    fetchData();
  }, [backendUrl, filters]);

  const handlePrint = () => {
    const printContents = `
      <h2 style="text-align:center;">Senior Citizens Report</h2>
      <table style="width:100%; border-collapse: collapse; margin-top:20px;">
        <thead>
          <tr>
            <th style="border:1px solid #333; padding:6px;">#</th>
            <th style="border:1px solid #333; padding:6px;">Full Name</th>
            <th style="border:1px solid #333; padding:6px;">Gender</th>
            <th style="border:1px solid #333; padding:6px;">Age</th>
            <th style="border:1px solid #333; padding:6px;">Barangay</th>
            <th style="border:1px solid #333; padding:6px;">Remarks</th>
            <th style="border:1px solid #333; padding:6px;">Created At</th>
          </tr>
        </thead>
        <tbody>
          ${citizens
            .map(
              (c, idx) => `
            <tr>
              <td style="border:1px solid #333; padding:6px;">${idx + 1}</td>
              <td style="border:1px solid #333; padding:6px;">
                ${c.lastName}, ${c.firstName} ${c.middleName || ""} ${
                c.suffix || ""
              }
              </td>
              <td style="border:1px solid #333; padding:6px;">${c.gender}</td>
              <td style="border:1px solid #333; padding:6px;">${c.age}</td>
              <td style="border:1px solid #333; padding:6px;">${
                c.barangay_name || ""
              }</td>
              <td style="border:1px solid #333; padding:6px;">
                ${c.form_data?.remarks || ""}
              </td>
              <td style="border:1px solid #333; padding:6px;">
                ${new Date(c.created_at).toLocaleDateString()}
              </td>
            </tr>
          `
            )
            .join("")}
          <tr>
            <td colspan="7" style="border:1px solid #333; padding:6px; font-weight:bold; text-align:right;">
              Total: ${citizens.length}
            </td>
          </tr>
        </tbody>
      </table>
    `;

    const newWindow = window.open("", "", "width=1000,height=700");
    newWindow.document.write(`
      <html>
        <head>
          <title>Senior Citizens Report</title>
        </head>
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
