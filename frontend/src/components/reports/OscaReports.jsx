import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Printer, FileDown } from "lucide-react";
import Button from "../UI/Button"; // assuming you have a reusable Button
import { useReactToPrint } from "react-to-print";

const OscaReports = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [reports, setReports] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const tableRef = React.useRef();

  // Fetch data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${backendUrl}/reports/monthly?year=${year}`
        );
        setReports(res.data || []);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [year]);

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: tableRef,
    documentTitle: `Monthly Report ${year}`,
  });

  // Export to CSV
  const exportCSV = () => {
    if (!reports.length) return;
    const headers = Object.keys(reports[0]).join(",");
    const rows = reports.map((r) => Object.values(r).join(",")).join("\n");
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `monthly_report_${year}.csv`;
    link.click();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Monthly Senior Citizen Report</h2>

      {/* Year Selector */}
      <div className="flex items-center gap-2 mb-4">
        <label className="font-semibold">Year:</label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <Button onClick={handlePrint} icon={<Printer size={16} />}>
          Print
        </Button>
        <Button onClick={exportCSV} icon={<FileDown size={16} />}>
          Export CSV
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin" size={20} /> Loading...
        </div>
      ) : (
        <div ref={tableRef} className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Month</th>
                <th className="border p-2">SocPen</th>
                <th className="border p-2">Non-SocPen</th>
                <th className="border p-2">Deceased</th>
                <th className="border p-2">Transferee</th>
                <th className="border p-2">PDL (M)</th>
                <th className="border p-2">PDL (F)</th>
                <th className="border p-2">New (M)</th>
                <th className="border p-2">New (F)</th>
                <th className="border p-2">UTP (M)</th>
                <th className="border p-2">UTP (F)</th>
                <th className="border p-2">Booklet (M)</th>
                <th className="border p-2">Booklet (F)</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={i}>
                  <td className="border p-2 font-semibold">{r.month}</td>
                  <td className="border p-2 text-center">{r.socpen}</td>
                  <td className="border p-2 text-center">{r.nonsocpen}</td>
                  <td className="border p-2 text-center">{r.deceased}</td>
                  <td className="border p-2 text-center">{r.transferee}</td>
                  <td className="border p-2 text-center">{r.pdl_male}</td>
                  <td className="border p-2 text-center">{r.pdl_female}</td>
                  <td className="border p-2 text-center">{r.new_male}</td>
                  <td className="border p-2 text-center">{r.new_female}</td>
                  <td className="border p-2 text-center">{r.utp_male}</td>
                  <td className="border p-2 text-center">{r.utp_female}</td>
                  <td className="border p-2 text-center">{r.booklet_male}</td>
                  <td className="border p-2 text-center">{r.booklet_female}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OscaReports;
