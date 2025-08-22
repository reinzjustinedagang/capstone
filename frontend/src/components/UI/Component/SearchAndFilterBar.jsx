import React from "react";
import SearchInput from "./SearchInput";
import FilterToggles from "./FilterToggles";
import AdvancedFilters from "./AdvanceFilters";

const SearchAndFilterBar = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  filterAge,
  setFilterAge,
  filterGender,
  setFilterGender,
  filterBarangay,
  setFilterBarangay,
  filterHealthStatus,
  setFilterHealthStatus,
  clearFilters,
  AgeOptions,
  genderOptions,
  barangayOptions,
  healthStatusOptions,
}) => {
  return (
    <div className="p-4 border-b border-gray-200 space-y-4">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <SearchInput value={searchTerm} onChange={setSearchTerm} />
        <FilterToggles
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          clearFilters={clearFilters}
          filters={{
            filterAge,
            filterGender,
            filterBarangay,
            filterHealthStatus,
          }}
        />
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <AdvancedFilters
          filterAge={filterAge}
          setFilterAge={setFilterAge}
          filterGender={filterGender}
          setFilterGender={setFilterGender}
          filterBarangay={filterBarangay}
          setFilterBarangay={setFilterBarangay}
          filterHealthStatus={filterHealthStatus}
          setFilterHealthStatus={setFilterHealthStatus}
          AgeOptions={AgeOptions}
          genderOptions={genderOptions}
          barangayOptions={barangayOptions}
          healthStatusOptions={healthStatusOptions}
        />
      )}
    </div>
  );
};

export default SearchAndFilterBar;
