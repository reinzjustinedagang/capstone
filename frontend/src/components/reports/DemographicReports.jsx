import React from "react";
import AgeDistribution from "./chart/AgeDistribution";
import GenderDistribution from "./chart/GenderDistribution";
import HealthStatus from "./chart/HealthStatus";
import BarangayDistribution from "./chart/BarangayDistribution";
import ActivityStatus from "./chart/ActivityStatus";
import StatisticalSummary from "./chart/StatisticalSummary";

const DemographicReports = () => {
  return (
    <div className="space-y-6">
      {/* Barangay chart takes full width */}
      <div>
        <BarangayDistribution />
      </div>

      {/* Other charts in a grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AgeDistribution />
        <GenderDistribution />
        <HealthStatus />
        <ActivityStatus />
        <StatisticalSummary />
      </div>
    </div>
  );
};

export default DemographicReports;
