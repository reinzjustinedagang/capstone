import React from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Printer } from "lucide-react";
import SeniorCitizenID from "./SeniorCitizenID";
import user from "../../assets/user.png";

const SeniorCitizenIDPDF = ({ citizen }) => {
  if (!citizen) return null;

  const data = {
    name: `${citizen.firstName} ${citizen.middleName || ""} ${
      citizen.lastName
    } ${citizen.suffix || ""}`.trim(),
    address: `${
      citizen.form_data?.street ? citizen.form_data.street + ", " : ""
    }Brgy. ${citizen.barangay_name || "Unknown"}`,
    municipality:
      `${citizen.form_data?.municipality || "San Jose"}` +
      `, ${citizen.form_data?.province || "Occidental Mindoro"}`,
    dob: citizen.form_data?.birthdate || "",
    sex: citizen.gender || "",
    dateIssued: new Date().toLocaleDateString("en-US"),
    controlNo: citizen.form_data?.idNumber || "",
    photoUrl: citizen.photo || user,
  };

  return (
    <div className="p-4">
      {/* Preview PDF */}
      <PDFViewer width="100%" height={400}>
        <SeniorCitizenID {...data} />
      </PDFViewer>

      {/* Download Button */}
      <PDFDownloadLink
        document={<SeniorCitizenID {...data} />}
        fileName={`senior_citizen_id_${citizen.id}.pdf`}
      >
        {({ loading }) => (
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 cursor-pointer">
            <Printer size={16} />
            {loading ? "Generating PDF..." : "Export PDF"}
          </button>
        )}
      </PDFDownloadLink>
    </div>
  );
};

export default SeniorCitizenIDPDF;
