import React from "react";

const Pagination = ({ page, limit, totalCount, setPage }) => {
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <p className="text-sm text-gray-700">
        Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
        <span className="font-medium">
          {Math.min(page * limit, totalCount)}
        </span>{" "}
        of <span className="font-medium">{totalCount}</span> results
      </p>
      <nav
        className="inline-flex -space-x-px rounded-md shadow-sm"
        aria-label="Pagination"
      >
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
              page === i + 1
                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
