import React, { useEffect, useState, useMemo } from "react";
import { PDFDownloadLink, PDFViewer, pdf } from "@react-pdf/renderer";
import { Printer, Eye } from "lucide-react";
import SeniorCitizenID from "./SeniorCitizenID"; // PDF layout
import user from "../../assets/user.png";
import axios from "axios";
import { Buffer } from "buffer";
window.Buffer = Buffer;

const SeniorCitizenIDPDF = ({ citizen, zipCode, oscaHead, mayor }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!citizen) return null;

  const middleInitial = citizen.middleName
    ? `${citizen.middleName.charAt(0).toUpperCase()}.`
    : "";

  const documentData = useMemo(() => {
    return {
      name: `${citizen.firstName} ${middleInitial} ${citizen.lastName} ${
        citizen.suffix || ""
      }`.trim(),
      address: (() => {
        const street = citizen.form_data?.street
          ? `${citizen.form_data.street}, `
          : "";

        const barangayName = citizen.barangay_name || "Unknown";
        const hasBarangayWord = /(brgy|barangay)/i.test(barangayName);

        return `${street}${
          hasBarangayWord ? barangayName : `Brgy. ${barangayName}`
        }`;
      })(),

      municipality: `${citizen.form_data?.municipality || "San Jose"}, ${
        citizen.form_data?.province || "Occidental Mindoro"
      }`,
      dob: citizen.form_data?.birthdate || "",
      sex: citizen.gender || "",
      dateIssued: new Date().toLocaleDateString("en-US"),
      controlNo: citizen.form_data?.idNumber || "",
      photoUrl: citizen.photo || user,
      zipCode: zipCode || "",
      oscaHead: oscaHead || "",
      mayor: mayor || "",
    };
  }, [citizen, zipCode, oscaHead, mayor]);

  const pdfDoc = useMemo(() => {
    return <SeniorCitizenID {...documentData} />;
  }, [documentData]);

  // 🔥 Function to open PDF in new tab
  const handleViewInNewTab = async () => {
    const blob = await pdf(pdfDoc).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank"); // open in new tab
  };

  return (
    <div className="p-4">
      {/* Desktop Preview */}
      {!isMobile && (
        <PDFViewer width="100%" height={400}>
          {pdfDoc}
        </PDFViewer>
      )}

      <div className="flex justify-end gap-3 mt-4">
        {/* Download button */}
        <PDFDownloadLink
          document={pdfDoc}
          fileName={`senior_citizen_id_${citizen.id}.pdf`}
        >
          {({ loading }) => (
            <button
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Printer size={16} />
              {loading ? "Generating PDF..." : "Export PDF"}
            </button>
          )}
        </PDFDownloadLink>

        {/* View in new tab (only mobile) */}
        {isMobile && (
          <button
            onClick={handleViewInNewTab}
            className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2 cursor-pointer"
          >
            <Eye size={16} />
            View in New Tab
          </button>
        )}
      </div>

      {/* Mobile fallback note */}
      {isMobile && (
        <p className="text-sm text-gray-600 mt-2">
          PDF preview is not supported on mobile. Use "View in New Tab" or
          "Export PDF".
        </p>
      )}
    </div>
  );
};

export default SeniorCitizenIDPDF;
