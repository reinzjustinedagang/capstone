import React from "react";
import SearchInput from "./SearchInput";
import FilterToggles from "./FilterToggles";
import AdvancedFilters from "./AdvancedFilters";

const AuditLogsFilterBar = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  filterUser,
  setFilterUser,
  filterRole,
  setFilterRole,
  filterActionType,
  setFilterActionType,
  clearFilters,
  userOptions,
  roleOptions,
  actionTypeOptions,
}) => (
  <div className="p-4 border-b border-gray-200 space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
      <SearchInput value={searchTerm} onChange={setSearchTerm} />
      <FilterToggles
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        clearFilters={clearFilters}
        filters={{
          filterUser,
          filterRole,
          filterActionType,
        }}
      />
    </div>
    {showFilters && (
      <AdvancedFilters
        filterUser={filterUser}
        setFilterUser={setFilterUser}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        filterActionType={filterActionType}
        setFilterActionType={setFilterActionType}
        userOptions={userOptions}
        roleOptions={roleOptions}
        actionTypeOptions={actionTypeOptions}
        // Only these three filters for audit logs
      />
    )}
  </div>
);

export default AuditLogsFilterBar;
