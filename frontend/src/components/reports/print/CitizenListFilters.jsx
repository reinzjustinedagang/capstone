// CitizenListFilters.jsx
import React from "react";

const CitizenListFilters = ({ filters, setFilters }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Gender Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Gender
        </label>
        <select
          value={filters.gender}
          onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
          className="border border-gray-300 px-3 py-2 rounded-md w-full"
        >
          <option value="All">All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      {/* Barangay Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Barangay
        </label>
        <select
          value={filters.barangay}
          onChange={(e) => setFilters({ ...filters, barangay: e.target.value })}
          className="border border-gray-300 px-3 py-2 rounded-md w-full"
        >
          <option value="All Barangays">All Barangays</option>
          <option value="Barangay 1">Barangay 1</option>
          <option value="Barangay 2">Barangay 2</option>
          <option value="Barangay 3">Barangay 3</option>
          {/* You can fetch barangays from backend instead of hardcoding */}
        </select>
      </div>

      {/* Remarks Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Remarks
        </label>
        <select
          value={filters.remarks}
          onChange={(e) => setFilters({ ...filters, remarks: e.target.value })}
          className="border border-gray-300 px-3 py-2 rounded-md w-full"
        >
          <option value="All Remarks">All Remarks</option>
          <option value="Healthy">Healthy</option>
          <option value="PWD">PWD</option>
          <option value="Bedridden">Bedridden</option>
        </select>
      </div>
    </div>
  );
};

export default CitizenListFilters;
