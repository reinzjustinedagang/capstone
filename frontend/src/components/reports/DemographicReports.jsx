import React, { useRef } from "react";
import AgeDistribution from "./chart/AgeDistribution";
import GenderDistribution from "./chart/GenderDistribution";
import BarangayDistribution from "./chart/BarangayDistribution";
import StatisticalSummary from "./chart/StatisticalSummary";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { GalleryVertical, GalleryHorizontal } from "lucide-react";

const DemographicReports = () => {
  const barangayRef = useRef();
  const ageRef = useRef();
  const genderRef = useRef();

  // Export function with orientation option
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

  return (
    <div className="space-y-6">
      {/* Barangay Chart */}
      <div>
        <div className="flex justify-end items-center mb-2 relative">
          <div className="flex space-x-2">
            <button
              onClick={() =>
                handleExport(barangayRef, "barangay-report.pdf", "p")
              }
              className="flex items-center px-3 py-2 text-sm rounded-lg bg-blue-600 text-white transition hover:bg-blue-700"
            >
              <GalleryHorizontal className="h-4 w-4 mr-2" />
              Portrait
            </button>
            <button
              onClick={() =>
                handleExport(barangayRef, "barangay-report.pdf", "l")
              }
              className="flex items-center px-3 py-2 text-sm rounded-lg bg-green-600 text-white transition hover:bg-green-700"
            >
              <GalleryVertical className="h-4 w-4 mr-2" />
              Landscape
            </button>
          </div>
        </div>
        <div ref={barangayRef}>
          <BarangayDistribution />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <div>
          <div className="flex justify-end items-center mb-2 relative">
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  handleExport(genderRef, "gender-report.pdf", "p")
                }
                className="flex items-center px-3 py-2 text-sm rounded-lg bg-blue-600 text-white transition hover:bg-blue-700"
              >
                <GalleryHorizontal className="h-4 w-4 mr-2" />
                Portrait
              </button>
              <button
                onClick={() =>
                  handleExport(genderRef, "gender-report.pdf", "l")
                }
                className="flex items-center px-3 py-2 text-sm rounded-lg bg-green-600 text-white transition hover:bg-green-700"
              >
                <GalleryVertical className="h-4 w-4 mr-2" />
                Landscape
              </button>
            </div>
          </div>
          <div ref={genderRef}>
            <GenderDistribution />
          </div>
        </div>

        {/* Age Distribution */}
        <div>
          <div className="flex justify-end items-center mb-2 relative">
            <div className="flex space-x-2">
              <button
                onClick={() => handleExport(ageRef, "age-report.pdf", "p")}
                className="flex items-center px-3 py-2 text-sm rounded-lg bg-blue-600 text-white transition hover:bg-blue-700"
              >
                <GalleryHorizontal className="h-4 w-4 mr-2" />
                Portrait
              </button>
              <button
                onClick={() => handleExport(ageRef, "age-report.pdf", "l")}
                className="flex items-center px-3 py-2 text-sm rounded-lg bg-green-600 text-white transition hover:bg-green-700"
              >
                <GalleryVertical className="h-4 w-4 mr-2" />
                Landscape
              </button>
            </div>
          </div>
          <div ref={ageRef}>
            <AgeDistribution />
          </div>
        </div>

        {/* Statistical Summary (no export buttons) */}
        <div>
          <StatisticalSummary />
        </div>
      </div>
    </div>
  );
};

export default DemographicReports;
