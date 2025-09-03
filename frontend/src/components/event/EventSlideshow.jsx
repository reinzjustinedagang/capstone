import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

const EventSlideshow = () => {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/events/slideshow`, {
        withCredentials: true,
      });
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [events]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  };

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        No events to display.
      </div>
    );
  }

  const currentEvent = events[currentIndex];

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gray-100">
      {/* Slide */}
      <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
        {currentEvent.image_url ? (
          <img
            src={currentEvent.image_url}
            alt={currentEvent.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
            No Image
          </div>
        )}

        {/* Overlay */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-6 py-4 rounded-lg text-center max-w-xl">
          <h2 className="text-2xl font-bold">{currentEvent.title}</h2>
          <p className="text-sm mt-2 line-clamp-3">
            {currentEvent.description}
          </p>
          <p className="text-xs mt-1">
            {new Date(currentEvent.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white text-black p-3 rounded-full shadow-md"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white text-black p-3 rounded-full shadow-md"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {events.map((_, idx) => (
          <span
            key={idx}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default EventSlideshow;
