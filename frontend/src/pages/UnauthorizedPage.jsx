import React from "react";
import { Link } from "react-router-dom";
import { ShieldOff, LogIn } from "lucide-react"; // Importing relevant icons

export default function UnauthorizedPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-inter overflow-hidden">
      {/* Background animation elements - consistent with other auth pages */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-64 h-64 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 bottom-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative z-10 text-center bg-white p-8 rounded-xl shadow-2xl max-w-lg mx-auto transform transition-all duration-300 hover:shadow-3xl">
        <ShieldOff className="mx-auto h-20 w-20 text-red-600 mb-6" />{" "}
        {/* Large icon */}
        <h1 className="text-6xl font-extrabold text-gray-900 mb-4">403</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Unauthorized Access
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          You don't have permission to view this page.
          <br /> Please log in with an authorized account.
        </p>
        <Link
          to="/login" // Link back to the login page
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-md text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <LogIn className="h-5 w-5 mr-2" />
          Go Back
        </Link>
      </div>
    </div>
  );
}
