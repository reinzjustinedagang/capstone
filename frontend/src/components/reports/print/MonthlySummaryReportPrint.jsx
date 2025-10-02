import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Button from "../../UI/Button";
import { Printer } from "lucide-react";

const MonthlySummaryReportPrint = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState({
    socpen: [],
    nonsocpen: [],
    deceased: [],
    transferee: [],
    pdl: [],
    newApplicant: [],
    utp: [],
    booklet: [],
  });

  const reportRef = useRef();

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

  useEffect(() => {
    fetchAllData();
  }, [year]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const endpoints = [
        "socpen",
        "non-socpen",
        "deceased",
        "transferees",
        "pdl",
        "new",
        "utp",
        "booklet",
      ];

      const requests = endpoints.map((endpoint) =>
        axios.get(`${backendUrl}/api/charts/${endpoint}?year=${year}`)
      );

      const responses = await Promise.all(requests);

      setReportData({
        socpen: responses[0].data,
        nonsocpen: responses[1].data,
        deceased: responses[2].data,
        transferee: responses[3].data,
        pdl: responses[4].data,
        newApplicant: responses[5].data,
        utp: responses[6].data,
        booklet: responses[7].data,
      });
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMonthData = (dataset, monthName) => {
    const monthIndex = months.indexOf(monthName);
    const monthAbbr = new Date(0, monthIndex).toLocaleString("en", {
      month: "short",
    });
    const data = dataset.find((item) => item.month === monthAbbr);
    return {
      male: data?.male || 0,
      female: data?.female || 0,
      total: (data?.male || 0) + (data?.female || 0),
    };
  };

  const calculateTotals = (dataset) => {
    return dataset.reduce(
      (acc, item) => ({
        male: acc.male + (item.male || 0),
        female: acc.female + (item.female || 0),
        total: acc.total + (item.male || 0) + (item.female || 0),
      }),
      { male: 0, female: 0, total: 0 }
    );
  };

  const handlePrint = () => {
    if (!reportRef.current) return;

    const printContents = reportRef.current.innerHTML;
    const newWindow = window.open("", "", "width=1200,height=800");
    newWindow.document.write(`
      <html>
        <head>
          <title>Annual Summary Report ${year}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              font-size: 12px;
            }
            .report-header {
              text-align: center;
              margin-bottom: 30px;
            }
            .report-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .report-year {
              font-size: 18px;
              color: #666;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
            }
            th, td { 
              border: 2px solid #333; 
              padding: 8px; 
              text-align: center;
              font-weight: bold;
            }
            th { 
              background-color: #f0f0f0; 
              font-size: 11px;
              writing-mode: vertical-rl;
              text-orientation: mixed;
              height: 120px;
            }
            .month-header {
              writing-mode: horizontal-tb !important;
              text-orientation: mixed;
              height: auto !important;
              background-color: #e0e0e0;
              font-size: 12px;
            }
            .total-row {
              background-color: #f9f9f9;
              font-weight: bold;
            }
            .male-cell { color: #2563eb; }
            .female-cell { color: #dc2626; }
            .total-cell { color: #059669; font-weight: bold; }
            .category-totals {
              margin-top: 30px;
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
            }
            .total-box {
              border: 2px solid #333;
              padding: 15px;
              text-align: center;
            }
            .total-label {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .total-value {
              font-size: 18px;
              color: #059669;
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
  };

  const totals = {
    socpen: calculateTotals(reportData.socpen),
    nonsocpen: calculateTotals(reportData.nonsocpen),
    deceased: calculateTotals(reportData.deceased),
    transferee: calculateTotals(reportData.transferee),
    pdl: calculateTotals(reportData.pdl),
    newApplicant: calculateTotals(reportData.newApplicant),
    utp: calculateTotals(reportData.utp),
    booklet: calculateTotals(reportData.booklet),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
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
              (_, i) => new Date().getFullYear() - i
            ).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

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

      <div ref={reportRef} style={{ display: "none" }}>
        <div
          className="report-header"
          style={{ textAlign: "center", marginBottom: 30 }}
        >
          <div
            className="report-title"
            style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}
          >
            Annual Summary Report
          </div>
          <div className="report-year" style={{ fontSize: 18, color: "#666" }}>
            {year}
          </div>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            margin: "20px 0",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  writingMode: "horizontal-tb",
                  textOrientation: "mixed",
                  backgroundColor: "#e0e0e0",
                  height: "auto",
                  fontSize: 12,
                }}
              >
                MONTH
              </th>
              {[
                "SOC-PEN",
                "NON-SOCPEN",
                "DECEASED",
                "TRANSFER",
                "PDL",
                "NEW APPLICANT",
                "UTP",
                "BOOKLET",
              ].flatMap((label) => [
                <th
                  key={`${label}-M`}
                  style={{
                    border: "1px solid #333",
                    padding: 8,
                    fontWeight: "bold",
                    color: "#000000",
                  }}
                >
                  {label}
                  <br />
                  MALE
                </th>,
                <th
                  key={`${label}-F`}
                  style={{
                    border: "1px solid #333",
                    padding: 8,
                    fontWeight: "bold",
                    color: "#000000",
                  }}
                >
                  {label}
                  <br />
                  FEMALE
                </th>,
              ])}
            </tr>
          </thead>
          <tbody>
            {months.map((month) => {
              const socpen = getMonthData(reportData.socpen, month);
              const nonsocpen = getMonthData(reportData.nonsocpen, month);
              const deceased = getMonthData(reportData.deceased, month);
              const transferee = getMonthData(reportData.transferee, month);
              const pdl = getMonthData(reportData.pdl, month);
              const newApplicant = getMonthData(reportData.newApplicant, month);
              const utp = getMonthData(reportData.utp, month);
              const booklet = getMonthData(reportData.booklet, month);

              return (
                <tr key={month}>
                  <td style={{ border: "1px solid #333", padding: 8 }}>
                    {month}
                  </td>
                  {[
                    socpen,
                    nonsocpen,
                    deceased,
                    transferee,
                    pdl,
                    newApplicant,
                    utp,
                    booklet,
                  ].flatMap((data, i) => [
                    <td
                      key={`${month}-M-${i}`}
                      style={{
                        border: "1px solid #333",
                        padding: 8,
                        color: "#000000",
                        fontWeight: "bold",
                      }}
                    >
                      {data.male || ""}
                    </td>,
                    <td
                      key={`${month}-F-${i}`}
                      style={{
                        border: "1px solid #333",
                        padding: 8,
                        color: "#000000",
                        fontWeight: "bold",
                      }}
                    >
                      {data.female || ""}
                    </td>,
                  ])}
                </tr>
              );
            })}
            <tr style={{ backgroundColor: "#f9f9f9", fontWeight: "bold" }}>
              <td style={{ border: "1px solid #333", padding: 8 }}>TOTAL</td>
              {[
                totals.socpen,
                totals.nonsocpen,
                totals.deceased,
                totals.transferee,
                totals.pdl,
                totals.newApplicant,
                totals.utp,
                totals.booklet,
              ].flatMap((data, i) => [
                <td
                  key={`total-M-${i}`}
                  style={{
                    border: "1px solid #333",
                    padding: 8,
                    color: "#000000",
                    fontWeight: "bold",
                  }}
                >
                  {data.male}
                </td>,
                <td
                  key={`total-F-${i}`}
                  style={{
                    border: "1px solid #333",
                    padding: 8,
                    color: "#000000",
                    fontWeight: "bold",
                  }}
                >
                  {data.female}
                </td>,
              ])}
            </tr>
          </tbody>
        </table>

        <div
          className="category-totals"
          style={{
            marginTop: 30,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
          }}
        >
          {[
            { label: "SOC-PEN TOTAL", data: totals.socpen },
            { label: "NON-SOCPEN TOTAL", data: totals.nonsocpen },
            { label: "NEW APPLICANTS", data: totals.newApplicant },
            { label: "BOOKLETS ISSUED", data: totals.booklet },
            { label: "DECEASED", data: totals.deceased },
            { label: "TRANSFEREES", data: totals.transferee },
            { label: "PDL", data: totals.pdl },
            { label: "UTP", data: totals.utp },
          ].map(({ label, data }) => (
            <div
              key={label}
              className="total-box"
              style={{
                border: "1px solid #333",
                padding: 15,
                textAlign: "center",
              }}
            >
              <div
                className="total-label"
                style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}
              >
                {label}
              </div>
              <div
                className="total-value"
                style={{ fontSize: 18, color: "#000000" }}
              >
                {data.total}
              </div>
              <div style={{ fontSize: 12, marginTop: 5 }}>
                M: {data.male} | F: {data.female}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlySummaryReportPrint;
