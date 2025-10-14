import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Gift } from "lucide-react";

export const HomeBenefitsPage = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenefits = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/benefits/allbenefits`);
        setBenefits(res.data);
      } catch (err) {
        console.error("Error fetching benefits:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBenefits();
  }, [backendUrl]);

  return (
    <div className="bg-white py-6">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Benefits
        </h1>

        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <p>Loading benefits...</p>
          </div>
        ) : benefits.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-2xl font-semibold mb-4">No benefits available</p>
            <p>Check back later for new benefits and offers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Link
                key={benefit.id}
                to={`/benefits/${benefit.id}`}
                className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 
                           rounded-xl shadow-md cursor-pointer hover:shadow-lg 
                           hover:-translate-y-1 transition-transform overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative w-full h-40">
                  <img
                    src={
                      benefit.image_url ||
                      "https://placehold.co/400x250?text=Benefits"
                    }
                    alt={benefit.type}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col justify-between flex-grow">
                  <div>
                    {/* <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold line-clamp-2 text-gray-900">
                        {benefit.provider}
                      </h3>
                    </div> */}
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {benefit.description}
                    </p>
                  </div>

                  {/* Footer Tag with Benefit Type */}
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full capitalize">
                    {benefit.type === "national"
                      ? "National Benefit"
                      : "Local Benefit"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
