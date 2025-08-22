import React from "react";

const SelectFilter = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <select
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const AdvancedFilters = ({
  filterAge,
  setFilterAge,
  filterGender,
  setFilterGender,
  filterBarangay,
  setFilterBarangay,
  filterHealthStatus,
  setFilterHealthStatus,
  AgeOptions,
  genderOptions,
  barangayOptions,
  healthStatusOptions,
}) => (
  <div className="grid grid-cols-4 md:grid-cols-5 gap-4 pt-2 border-t border-gray-200">
    <SelectFilter
      label="Age"
      value={filterAge}
      onChange={setFilterAge}
      options={AgeOptions}
    />
    <SelectFilter
      label="Gender"
      value={filterGender}
      onChange={setFilterGender}
      options={genderOptions}
    />
    <SelectFilter
      label="Barangay"
      value={filterBarangay}
      onChange={setFilterBarangay}
      options={barangayOptions}
    />
    <SelectFilter
      label="Health Status"
      value={filterHealthStatus}
      onChange={setFilterHealthStatus}
      options={healthStatusOptions}
    />
  </div>
);

export default AdvancedFilters;
