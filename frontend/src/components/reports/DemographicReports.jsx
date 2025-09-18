import React, { useRef, useState } from "react";
import AgeDistribution from "./chart/AgeDistribution";
import GenderDistribution from "./chart/GenderDistribution";
import BarangayDistribution from "./chart/BarangayDistribution";
import StatisticalSummary from "./chart/StatisticalSummary";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { GalleryHorizontal, GalleryVertical, MoreVertical } from "lucide-react";

const DemographicReports = () => {
  const barangayRef = useRef();
  const ageRef = useRef();
  const genderRef = useRef();

  // Export function
  const handleExport = async (elementRef, filename, orientation = "p") => {
    if (!elementRef.current) return;
    const element = elementRef.current;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF(orientation, "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  };

  // Chart wrapper with 3-dot export menu
  const ChartWrapper = ({ children, title, refProp }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
      <div>
        <div className="flex justify-end mb-2">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded hover:bg-gray-200"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow-lg z-10">
                <button
                  className="block w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white"
                  onClick={() => handleExport(refProp, `${title}.pdf`, "p")}
                >
                  <GalleryHorizontal className="h-4 w-4 inline mr-2" />
                  Portrait
                </button>
                <button
                  className="block w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white"
                  onClick={() => handleExport(refProp, `${title}.pdf`, "l")}
                >
                  <GalleryVertical className="h-4 w-4 inline mr-2" />
                  Landscape
                </button>
              </div>
            )}
          </div>
        </div>
        <div ref={refProp}>{children}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ChartWrapper title="Barangay Distribution" refProp={barangayRef}>
        <BarangayDistribution />
      </ChartWrapper>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartWrapper title="Gender Distribution" refProp={genderRef}>
          <GenderDistribution />
        </ChartWrapper>
        <ChartWrapper title="Age Distribution" refProp={ageRef}>
          <AgeDistribution />
        </ChartWrapper>

        {/* Statistical summary without export */}
        <div className="bg-white p-4 rounded shadow">
          <StatisticalSummary />
        </div>
      </div>
    </div>
  );
};

export default DemographicReports;
