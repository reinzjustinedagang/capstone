import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../../UI/Button";
import { Printer } from "lucide-react";
import pilipinas_logo from "../../../assets/bagong-pilipinas.png";
import sj_logo from "../../../assets/municipal-logo.png";

const DeceasedReportPrint = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState("");
  const [deceasedData, setDeceasedData] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const months = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];

  const toDataURL = (url) =>
    fetch(url)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          }),
      );

  useEffect(() => {
    fetchDeceased();
  }, [year]);

  const fetchDeceased = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${backendUrl}/api/charts/deceased-name?year=${year}`,
      );
      setDeceasedData(res.data);
    } catch (err) {
      console.error("Failed to fetch deceased report:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch barangays
  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/barangays/all`);
        setBarangays(res.data || []);
      } catch (err) {
        console.error("Error fetching barangays:", err);
      }
    };
    fetchBarangays();
  }, [backendUrl]);

  const handlePrint = async () => {
    if (!monthFilter) {
      alert("Please select a month to print.");
      return;
    }

    // Get the month short name to match backend
    const monthShort = new Date(0, months.indexOf(monthFilter)).toLocaleString(
      "en",
      { month: "short" },
    );

    const monthData = deceasedData.find((d) => d.month === monthShort);

    if (!monthData || (!monthData.male.length && !monthData.female.length)) {
      alert("No data for the selected month.");
      return;
    }

    const combined = [
      ...(monthData.male || []).map((p) => ({ ...p, gender: "Male" })),
      ...(monthData.female || []).map((p) => ({ ...p, gender: "Female" })),
    ];

    const sjLogoBase64 = await toDataURL(sj_logo);
    const pilipinasLogoBase64 = await toDataURL(pilipinas_logo);

    // Map barangayId to barangay name
    const tableRows = combined
      .map((person, idx) => {
        const barangay = barangays.find((b) => b.id === person.barangayId);
        const barangayName = barangay ? barangay.barangay_name : "Unknown";
        return `
        <tr>
          <td>${idx + 1}</td>
          <td>${person.name}</td>
          <td>${person.gender}</td>
          <td>${barangayName}</td>
          <td>${new Date(person.dateDied).toLocaleDateString()}</td>
        </tr>
      `;
      })
      .join("");

    const tableHTML = `
    <h3 style="text-align:center; text-transform:uppercase; margin-bottom:10px;">
      ${monthFilter} ${year} - Deceased Report
    </h3>
    <table style="width:100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="border:1px solid #333; padding:5px;">#</th>
          <th style="border:1px solid #333; padding:5px;">Name</th>
          <th style="border:1px solid #333; padding:5px;">Gender</th>
          <th style="border:1px solid #333; padding:5px;">Barangay</th>
          <th style="border:1px solid #333; padding:5px;">Date Died</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows || `<tr><td colspan="5" style="text-align:center;">No data</td></tr>`}
      </tbody>
    </table>
  `;

    const newWindow = window.open("", "", "width=1200,height=800");
    newWindow.document.write(`
    <html>
      <head>
        <title>Deceased Report ${monthFilter} ${year}</title>
        <style>
          @page { size: A4 portrait; margin: 1cm; }
          body { font-family: Arial, sans-serif; padding: 10px; font-size: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #333; padding: 5px; text-align: left; font-size: 11px; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <img src="${sjLogoBase64}" alt="SJ Logo" style="height:70px; width:auto;" />
          <div style="text-align:center; line-height:1.2;">
            <h2 style="margin:0; font-size:16px; font-weight:bold;">Republic of the Philippines</h2>
            <h3 style="margin:0; font-size:14px; font-weight:bold;">Office for Senior Citizen Affairs</h3>
            <p style="margin:0; font-size:12px;">San Jose, Occidental Mindoro</p>
            <p style="margin-top:5px; font-size:12px;">${new Date().toLocaleDateString()}</p>
          </div>
          <img src="${pilipinasLogoBase64}" alt="Pilipinas Logo" style="height:70px; width:auto;" />
        </div>
        ${tableHTML}
      </body>
    </html>
  `);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        {/* Year Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Year:
          </label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border border-gray-300 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from(
              { length: 4 },
              (_, i) => new Date().getFullYear() - i,
            ).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Month Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Month:
          </label>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="border border-gray-300 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Month</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Print Button */}
        <Button
          variant="primary"
          icon={<Printer className="h-4 w-4 mr-2" />}
          onClick={handlePrint}
          disabled={loading}
          className="self-end"
        >
          {loading ? "Loading..." : "Print"}
        </Button>
      </div>
    </div>
  );
};

export default DeceasedReportPrint;
