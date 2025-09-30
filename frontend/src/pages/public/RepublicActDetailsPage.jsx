import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export const RepublicActDetailsPage = () => {
  const { id } = useParams();
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [act, setAct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAct = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/benefits/public-benefits/${id}`
        );
        setAct(res.data);
      } catch (err) {
        console.error("Error fetching RA details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAct();
  }, [backendUrl, id]);

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">Loading details...</p>
    );
  }

  if (!act) {
    return (
      <p className="text-center mt-10 text-gray-500">Republic Act not found.</p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-bold mb-4">{act.title}</h1>
      <p className="text-sm text-gray-600 mb-2">
        Enacted on:{" "}
        {new Date(act.enacted_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <p className="text-gray-700">{act.description}</p>
    </div>
  );
};
