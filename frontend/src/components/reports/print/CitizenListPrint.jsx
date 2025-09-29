import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Button from "../../UI/Button";
import { Printer } from "lucide-react";

const CitizenListPrint = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [citizens, setCitizens] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    gender: "",
    barangay: "",
  });

  const reportRef = useRef();

  // ✅ Fetch barangays for dropdown
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

  // ✅ Fetch citizens when filters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${backendUrl}/api/charts/citizens/print`, {
          params: filters,
        });
        setCitizens(res.data?.citizens || []);
      } catch (err) {
        console.error("Error fetching citizens for print:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [backendUrl, filters]);

  // ✅ Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Print only filtered citizens
  const handlePrint = () => {
    if (!reportRef.current) return;

    const printContents = reportRef.current.innerHTML;
    const newWindow = window.open("", "", "width=1000,height=700");
    newWindow.document.write(`
      <html>
        <head>
          <title>Senior Citizens List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #333; padding: 6px; font-size: 12px; }
            th { background-color: #f0f0f0; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
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

  return (
    <div className="space-y-4">
      {/* Filters + Print Button */}
      <div className="flex flex-col sm:flex-row items-end gap-4 mb-4">
        {/* Gender Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender:
          </label>
          <select
            name="gender"
            value={filters.gender}
            onChange={handleFilterChange}
            className="border border-gray-300 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Barangay Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Barangay:
          </label>
          <select
            name="barangay"
            value={filters.barangay}
            onChange={handleFilterChange}
            className="border border-gray-300 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Barangays</option>
            {barangays.length > 0 ? (
              barangays.map((b) => (
                <option key={b.id} value={b.barangay_name}>
                  {b.barangay_name}
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
          disabled={loading}
          className="self-end"
        >
          {loading ? "Loading..." : "Print"}
        </Button>
      </div>

      {/* Hidden Printable Report */}
      <div ref={reportRef} style={{ display: "none" }}>
        <h2>Senior Citizens List</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Gender</th>
              <th>Barangay</th>
            </tr>
          </thead>
          <tbody>
            {citizens.map((c, idx) => (
              <tr key={c.id || idx}>
                <td>{idx + 1}</td>
                <td>
                  {c.lastName}, {c.firstName} {c.middleName || ""}{" "}
                  {c.suffix || ""}
                </td>
                <td>{c.gender}</td>
                <td>{c.barangay_name || ""}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="4" style={{ textAlign: "right" }}>
                Total: {citizens.length}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CitizenListPrint;
