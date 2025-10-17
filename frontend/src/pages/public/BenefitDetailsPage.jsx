import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

export const BenefitDetailsPage = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const { id } = useParams();
  const [benefit, setBenefit] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ for the Return button

  useEffect(() => {
    const fetchBenefit = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/benefits/public-benefits/${id}`
        );
        setBenefit(res.data);
      } catch (err) {
        console.error("Error fetching benefit:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBenefit();
  }, [id, backendUrl]);

  if (loading) {
    return <div className="text-center py-16">Loading benefit...</div>;
  }

  if (!benefit) {
    return <div className="text-center py-16">Benefit not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-5">
      {/* ✅ Return Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-800 hover:text-blue-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Return</span>
      </button>

      {/* Benefit Image */}
      <img
        src={benefit.image_url || "https://placehold.co/800x400?text=Benefits"}
        alt={benefit.title}
        className="w-full h-[400px] object-cover object-center rounded-lg mb-6"
        onClick={() =>
          window.open(
            benefit.image_url || "https://placehold.co/800x400?text=Benefits",
            "_blank"
          )
        }
      />

      {/* Benefit Info */}
      <h1 className="text-3xl font-bold mb-2">{benefit.title}</h1>
      <p className="text-sm text-gray-600 mb-2 capitalize">
        Type: {benefit.type}
      </p>

      {benefit.enacted_date && (
        <p className="text-sm text-gray-500 mb-4">
          Enacted on:{" "}
          {new Date(benefit.enacted_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}

      <h2 className="text-lg font-semibold mb-2">Provider:</h2>
      <p className="mb-4">{benefit.provider}</p>

      <h2 className="text-lg font-semibold mb-2">Description:</h2>
      <p className="text-gray-700">{benefit.description}</p>
    </div>
  );
};
