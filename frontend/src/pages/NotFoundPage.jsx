import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon, Frown } from "lucide-react"; // Importing icons for the page

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 font-inter overflow-hidden">
      {/* Background animation elements - consistent with other auth pages */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 bottom-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative z-10 text-center bg-white p-8 rounded-xl shadow-2xl max-w-lg mx-auto transform transition-all duration-300 hover:shadow-3xl">
        <Frown className="mx-auto h-20 w-20 text-indigo-600 mb-6" />{" "}
        {/* Large icon */}
        <h1 className="text-6xl font-extrabold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/" // Link back to the homepage
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-md text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <HomeIcon className="h-5 w-5 mr-2" />
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
