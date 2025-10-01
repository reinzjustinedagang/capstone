import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Loader2, Gift } from "lucide-react";
import { Link } from "react-router-dom";

const Benefits = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchBenefits = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/benefits/`);
        setBenefits(res.data);
      } catch (err) {
        console.error("Error fetching benefits:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBenefits();
  }, [backendUrl]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="bg-white py-8 relative">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-center items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center flex items-center gap-2">
            Benefits
          </h2>
        </div>

        {/* Loading / Empty State */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            <p className="ml-3 text-gray-600 animate-pulse">
              Loading Benefits...
            </p>
          </div>
        ) : benefits.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-2xl font-semibold mb-4">No benefits available</p>
            <p>Check back later for new benefits and offers.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={scrollLeft}
              className="absolute -left-6 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-gray-100"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            {/* Scrollable Container */}
            <div
              ref={scrollRef}
              className="flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth px-2"
            >
              {benefits.map((benefit) => (
                <Link
                  key={benefit.id}
                  to={`/benefits/${benefit.id}`}
                  className="min-w-[260px] max-w-[280px] bg-gradient-to-br from-blue-50 to-white 
                             border border-blue-200 rounded-xl shadow-md cursor-pointer 
                             hover:shadow-lg hover:-translate-y-1 transition-transform flex-shrink-0 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative w-full h-40">
                    <img
                      src={benefit.image_url || "https://placehold.co/600x400"}
                      alt={benefit.provider}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold line-clamp-2 text-gray-900">
                        {benefit.provider}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {benefit.description}
                    </p>

                    {/* Footer Tag */}
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                      {benefit.type === "national"
                        ? "National Benefit"
                        : "Local Benefit"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={scrollRight}
              className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-gray-100"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        )}

        {/* Footer Link */}
        <div className="flex flex-col sm:flex-row justify-center items-center mt-8 gap-4 text-sm text-gray-700">
          <Link className="underline hover:text-blue-700" to="/benefits">
            See more...
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Benefits;
