import React from "react";
import { Search } from "lucide-react";

const SearchInput = ({ value, onChange }) => (
  <div className="relative w-full sm:w-64">
    <input
      type="text"
      placeholder="Search senior citizens..."
      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
  </div>
);

export default SearchInput;
