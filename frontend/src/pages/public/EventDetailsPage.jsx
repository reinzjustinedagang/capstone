import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

export const EventDetailsPage = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ for back navigation

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/events/public-events/${id}`
        );
        setEvent(res.data);
      } catch (err) {
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, backendUrl]);

  if (loading) {
    return <div className="text-center py-16">Loading event...</div>;
  }

  if (!event) {
    return <div className="text-center py-16">Event not found</div>;
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

      {/* Event Image */}
      <img
        src={event.image_url || "https://placehold.co/800x400?text=Events"}
        alt={event.title}
        className="w-full h-[400px] object-cover object-center rounded-lg mb-6"
        onClick={() =>
          window.open(
            event.image_url || "https://placehold.co/800x400?text=Events",
            "_blank"
          )
        }
      />

      {/* Event Info */}
      <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
      <p className="text-sm text-gray-600 mb-4">
        {new Date(event.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <p className="text-gray-700">{event.description}</p>
    </div>
  );
};
