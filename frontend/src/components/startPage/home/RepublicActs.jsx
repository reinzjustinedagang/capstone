import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BookOpenTextIcon, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const RepublicActs = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [acts, setActs] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActs = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/benefits/front-ra`);
        setActs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching Republic Acts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActs();
  }, [backendUrl]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-white py-8 relative">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-center items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center flex items-center gap-2">
            Republic Acts
          </h2>
        </div>

        {/* Loading / Empty State */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            <p className="ml-3 text-gray-600 animate-pulse">
              Loading Republic Acts...
            </p>
          </div>
        ) : acts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-2xl font-semibold mb-4">
              No Republic Acts posted
            </p>
            <p>Check back later for updates.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Acts Scrollable Row */}
            <div
              ref={scrollRef}
              className="flex flex-wrap justify-center gap-6"
            >
              {Array.isArray(acts) &&
              acts.map((act, index) => (
                <div
                  key={act.id || index}
                  onClick={() => navigate(`/ra/${act.id}`)}
                  className="w-full max-w-[280px] bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    {/* <BookOpenTextIcon className="w-5 h-5 text-blue-600" /> */}
                    <h3 className="text-lg font-semibold line-clamp-2 text-gray-900">
                      {act.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {act.description}
                  </p>
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                    Enacted:{" "}
                    {new Date(act.enacted_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Footer Links */}
        <div className="flex flex-col sm:flex-row justify-center items-center mt-8 gap-4 text-sm text-gray-700">
          <Link to="/republic-acts" className="underline hover:text-blue-700">
            See more...
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RepublicActs;
