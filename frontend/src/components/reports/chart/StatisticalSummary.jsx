import React from "react";

const StatisticalSummary = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Statistical Summary</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Senior Citizens</p>
            <p className="text-2xl font-semibold">1,245</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Age</p>
            <p className="text-2xl font-semibold">72.5</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Members</p>
            <p className="text-2xl font-semibold">980</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">With Health Issues</p>
            <p className="text-2xl font-semibold">275</p>
          </div>
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Key Observations
          </h4>
          <ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
            <li>Majority of senior citizens are between 66-70 years old</li>
            <li>Female seniors slightly outnumber male seniors</li>
            <li>78.7% of seniors are actively participating in programs</li>
            <li>Poblacion has the highest concentration of senior citizens</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StatisticalSummary;
