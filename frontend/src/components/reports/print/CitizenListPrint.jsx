import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../../UI/Button";
import { Printer } from "lucide-react";

const CitizenListPrint = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [citizens, setCitizens] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [filters, setFilters] = useState({
    gender: "",
    barangay: "",
  });

  // Fetch barangays for dropdown
  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/barangays`);
        setBarangays(res.data || []);
      } catch (err) {
        console.error("Error fetching barangays:", err);
      }
    };
    fetchBarangays();
  }, [backendUrl]);

  // Fetch citizens when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
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

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Print only filtered citizens
  const handlePrint = () => {
    const reportHtml = `
    <div style="padding:20px; font-family: Arial, sans-serif;">
      <h2 style="text-align:center; margin-bottom:20px;">
        Senior Citizens Report
      </h2>
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border:1px solid #333; padding:6px;">#</th>
            <th style="border:1px solid #333; padding:6px;">Full Name</th>
            <th style="border:1px solid #333; padding:6px;">Gender</th>
            <th style="border:1px solid #333; padding:6px;">Barangay</th>
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
                <td style="border:1px solid #333; padding:6px;">${
                  c.barangay_name || ""
                }</td>
              </tr>
            `
            )
            .join("")}
          <tr>
            <td colspan="4" style="border:1px solid #333; padding:6px; font-weight:bold; text-align:right;">
              Total: ${citizens.length}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

    const printWindow = window.open("", "_blank", "width=1000,height=700");
    printWindow.document.open();
    printWindow.document.write(`
    <html>
      <head>
        <title>Senior Citizens Report</title>
        <style>
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            table th, table td {
              font-size: 12px;
            }
          }
        </style>
      </head>
      <body>
        ${reportHtml}
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Gender Filter */}
        <select
          name="gender"
          value={filters.gender}
          onChange={handleFilterChange}
          className="border rounded p-2"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        {/* Barangay Filter */}
        <select
          name="barangay"
          value={filters.barangay}
          onChange={handleFilterChange}
          className="border rounded p-2"
        >
          <option value="">All Barangays</option>
          {barangays?.length > 0 ? (
            barangays.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))
          ) : (
            <option disabled>No barangays available</option>
          )}
        </select>
      </div>

      {/* Print Button */}
      <Button
        variant="primary"
        icon={<Printer className="h-4 w-4 mr-2" />}
        onClick={handlePrint}
        className="w-full sm:w-auto flex justify-center"
      >
        Print Senior Citizens Report
      </Button>
    </div>
  );
};

export default CitizenListPrint;
