import React from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Printer } from "lucide-react";
import SeniorCitizenID from "./SeniorCitizenID";

const SeniorCitizenIDPDF = () => {
  const data = {
    name: "JESSIELOU R. MADRIAGA",
    address: "Labangan, Poblacion",
    municipality: "San Jose, Occ. Mindoro",
    dob: "10-12-61",
    sex: "F",
    dateIssued: "10-22-2021",
    controlNo: "123456",
  };

  return (
    <div className="p-4">
      {/* This renders the PDF document on the page for debugging */}
      <PDFViewer width="100%" height={400}>
        <SeniorCitizenID {...data} />
      </PDFViewer>
      <PDFDownloadLink
        document={<SeniorCitizenID {...data} />}
        fileName="senior_citizen_id.pdf"
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
