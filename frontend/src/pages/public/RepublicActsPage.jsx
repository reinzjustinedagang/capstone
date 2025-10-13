import React, { useState, useEffect } from "react";
import axios from "axios";
import { BookOpenTextIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/startPage/layout/Header";

export const RepublicActsPage = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [acts, setActs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActs = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/benefits/allra`);
        setActs(res.data);
      } catch (err) {
        console.error("Error fetching Republic Acts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActs();
  }, [backendUrl]);

  return (
    <div className="bg-white py-6">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Republic Acts
        </h1>

        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <p>Loading Republic Acts...</p>
          </div>
        ) : acts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-2xl font-semibold mb-4">
              No Republic Acts posted
            </p>
            <p>Check back later for updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acts.map((act) => (
              <div
                key={act.id}
                onClick={() => navigate(`/ra/${act.id}`)}
                className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <BookOpenTextIcon className="w-5 h-5 text-blue-600" />
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
        )}
      </div>
    </div>
  );
};
