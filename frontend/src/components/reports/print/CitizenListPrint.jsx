import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Button from "../../UI/Button";
import { Printer } from "lucide-react";

const CitizenListPrint = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [citizens, setCitizens] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remarksOptions, setRemarksOptions] = useState(["All Remarks"]);
  const [remarksOption, setRemarksOption] = useState("All Remarks");
  const [filters, setFilters] = useState({
    gender: "",
    barangay: "",
    remarks: "All Remarks",
  });
  const [notedBy, setNotedBy] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const reportRef = useRef();

  // ✅ Get logged-in user
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Fetch head official + remarks
  useEffect(() => {
    const fetchHead = async () => {
      try {
        const [headRes, remarksRes] = await Promise.all([
          axios.get(`${backendUrl}/api/officials/head`),
          axios.get(`${backendUrl}/api/senior-citizens/filters/remarks`),
        ]);
        setNotedBy(headRes.data?.name || "");
        setRemarksOptions(["All Remarks", ...remarksRes.data.remarks]);
      } catch (err) {
        console.error("Failed to fetch head official/remarks:", err);
      }
    };
    fetchHead();
  }, [backendUrl]);

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

  // ✅ Fetch citizens
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${backendUrl}/api/charts/citizens/print`, {
          params: { ...filters, remarks: remarksOption },
        });
        setCitizens(res.data?.citizens || []);
      } catch (err) {
        console.error("Error fetching citizens for print:", err);
      } finally {
        setLoading(false);
      }
    };

    setPreparedBy(user?.username || "System User");
    fetchData();
  }, [backendUrl, filters, remarksOption]);

  // ✅ Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Print report
  const handlePrint = () => {
    if (!reportRef.current) return;

    // ⬇️ Create filter summary for print header
    const selectedBarangay = filters.barangay || "All Barangays";
    const selectedRemarks = remarksOption || "All Remarks";
    const filterSummary = `${selectedRemarks} • ${selectedBarangay}`;

    const printContents = `
      <h3 style="text-align:center; margin-bottom: 5px; text-transform:uppercase;">
        San Jose, Occidental Mindoro
      </h3>
      <p style="text-align:center; margin: 0; font-weight: bold;">
        ${filterSummary}
      </p>
      <p style="text-align:center; margin-top: 0;">
        ${new Date().toLocaleDateString()}
      </p>

      <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
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
              <td style="border:1px solid #333; padding:6px; text-align:center;">
                ${idx + 1}
              </td>
              <td style="border:1px solid #333; padding:6px;">
                ${c.lastName}, ${c.firstName} ${c.middleName || ""} ${
                c.suffix || ""
              }
              </td>
              <td style="border:1px solid #333; padding:6px; text-align:center;">
                ${c.gender}
              </td>
              <td style="border:1px solid #333; padding:6px; text-align:center;">
                ${c.barangay_name || ""}
              </td>
            </tr>`
            )
            .join("")}
          <tr>
            <td colspan="4" style="text-align:right; padding:6px; font-weight:bold; border:1px solid #333;">
              Total: ${citizens.length}
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top:60px; display:flex; justify-content:space-between; width:80%; margin-left:auto; margin-right:auto;">
        <div style="text-align:center;">
          <p style="margin-bottom:60px;">Prepared by:</p>
          <p style="text-decoration:underline; font-weight:bold; text-transform:uppercase;">
            ${(preparedBy || "System User").toUpperCase()}
          </p>
          <p>OSCA STAFF</p>
        </div>
        <div style="text-align:center;">
          <p style="margin-bottom:60px;">Noted by:</p>
          <p style="text-decoration:underline; font-weight:bold; text-transform:uppercase;">
            ${(notedBy || "Municipal Head").toUpperCase()}
          </p>
          <p>MSWD/OIC-OSCA HEAD</p>
        </div>
      </div>
    `;

    const newWindow = window.open("", "", "width=1000,height=700");
    newWindow.document.write(`
      <html>
        <head>
          <title>Senior Citizens List</title>
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

        {/* Remarks Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks:
          </label>
          <select
            value={remarksOption}
            onChange={(e) => setRemarksOption(e.target.value)}
            className="border border-gray-300 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {remarksOptions.map((remark, i) => (
              <option key={i} value={remark}>
                {remark}
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

      {/* Hidden Printable Report */}
      <div ref={reportRef} style={{ display: "none" }}></div>
    </div>
  );
};

export default CitizenListPrint;
