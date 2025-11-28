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
  const [photoBase64, setPhotoBase64] = useState(null);

  // Function to convert file/blob to base64
  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Convert photo to Base64
  useEffect(() => {
    if (citizen.photo) {
      fetch(citizen.photo)
        .then((res) => res.blob())
        .then((blob) => toBase64(blob))
        .then((base64) => setPhotoBase64(base64))
        .catch((err) => console.error("Failed to load photo:", err));
    }
  }, [citizen.photo]);

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
      zipCode: zipCode || "",
      oscaHead: oscaHead || "",
      mayor: mayor || "",
    };
  }, [citizen, zipCode, oscaHead, mayor]);

  const pdfDoc = useMemo(() => {
    return (
      <SeniorCitizenID
        {...documentData}
        photoUrl={photoBase64 || user} // fallback to default
      />
    );
  }, [documentData, photoBase64]); // added photoBase64 dependency

  const handleViewInNewTab = async () => {
    const blob = await pdf(pdfDoc).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="p-4">
      {!isMobile && (
        <PDFViewer width="100%" height={400}>
          {pdfDoc}
        </PDFViewer>
      )}
      <div className="flex justify-end gap-3 mt-4">
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
