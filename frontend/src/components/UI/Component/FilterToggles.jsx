import React from "react";
import { Filter, ArrowDown, X } from "lucide-react";

const FilterToggles = ({
  showFilters,
  setShowFilters,
  clearFilters,
  filters,
}) => {
  const hasFilters =
    filters.filterBarangay !== "All Barangays" ||
    filters.filterHealthStatus !== "All Health Status" ||
    filters.filterAge !== "All" ||
    filters.filterGender !== "All";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors ${
          showFilters ? "text-gray-900 font-semibold" : ""
        }`}
      >
        <Filter className="h-4 w-4 mr-2" />
        Advanced Filters
        <ArrowDown
          className={`h-4 w-4 ml-2 transform transition-transform ${
            showFilters ? "rotate-180" : ""
          }`}
        />
      </button>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </button>
      )}
    </div>
  );
};

export default FilterToggles;
