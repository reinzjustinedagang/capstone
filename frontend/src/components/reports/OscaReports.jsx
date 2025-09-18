import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { GalleryHorizontal, GalleryVertical, MoreVertical } from "lucide-react"; // 3-dot icon
import NewSeniorReportsChart from "./chart/NewSeniorReportsChart";
import SocPenReportsChart from "./chart/SocPenReportsChart";
import NonSocPenReportsChart from "./chart/NonSocPenReportsChart";
import PDLReportsChart from "./chart/PDLReportsChart";
import BookletReportsChart from "./chart/BookletReportsChart";
import TransfereeReportsChart from "./chart/TransfereeReportsChart";
import DeceasedReportsChart from "./chart/DeceasedReportsChart";

const OscaReportsChart = () => {
  // refs for each chart
  const newSeniorRef = useRef();
  const socpenRef = useRef();
  const nonsocpenRef = useRef();
  const pdlRef = useRef();
  const bookletRef = useRef();
  const transfereeRef = useRef();
  const deceasedRef = useRef();

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

  // Chart wrapper component with print menu
  const ChartWrapper = ({ children, title, refProp }) => {
    const [showMenu, setShowMenu] = React.useState(false);

    return (
      <div>
        <div className="flex justify-end items-center mb-2">
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
      <ChartWrapper title="New Senior Citizens" refProp={newSeniorRef}>
        <NewSeniorReportsChart />
      </ChartWrapper>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartWrapper title="Social Pension" refProp={socpenRef}>
          <SocPenReportsChart />
        </ChartWrapper>
        <ChartWrapper title="Non-Social Pension" refProp={nonsocpenRef}>
          <NonSocPenReportsChart />
        </ChartWrapper>
        <ChartWrapper title="PDL" refProp={pdlRef}>
          <PDLReportsChart />
        </ChartWrapper>
        <ChartWrapper title="Booklet" refProp={bookletRef}>
          <BookletReportsChart />
        </ChartWrapper>
        <ChartWrapper title="Transferee" refProp={transfereeRef}>
          <TransfereeReportsChart />
        </ChartWrapper>
        <ChartWrapper title="Deceased" refProp={deceasedRef}>
          <DeceasedReportsChart />
        </ChartWrapper>
      </div>
    </div>
  );
};

export default OscaReportsChart;
