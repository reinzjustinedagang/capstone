import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import slider4 from "../../../assets/slider4.jpg";

const Slideshow = () => {
  const location = useLocation();
  const [eventsData, setEventsData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Fetch slideshow events from backend
  useEffect(() => {
    const fetchSlideshow = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/events/slideshow`);
        setEventsData(res.data || []);
      } catch (err) {
        console.error("Failed to load slideshow events:", err);
      }
    };
    fetchSlideshow();
  }, []);

  // Auto-slide every 5s
  useEffect(() => {
    if (eventsData.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % eventsData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [eventsData]);

  // Scroll logic
  useEffect(() => {
    if (location.state?.scrollToId) {
      const section = document.getElementById(location.state.scrollToId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  // If no events available
  if (eventsData.length === 0) {
    return (
      <section
        className="relative h-[60vh] md:h-[70vh] flex items-center justify-center"
        onClick={() => window.open(slider4, "_blank")}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url(${slider4})`,
          }}
        />
      </section>
    );
  }

  // Navigation
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? eventsData.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % eventsData.length);
  };

  return (
    <section
      className="relative h-[70vh] md:h-[60vh] flex items-center justify-center overflow-hidden shadow-lg  cursor-pointer"
      onClick={
        () => window.open(eventsData[currentIndex].image_url, "_blank") // 👈 open current image
      }
    >
      {/* Slide */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${eventsData[currentIndex].image_url})`, // 👈 matches DB field
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0" />

      {/* Navigation Buttons */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // 👈 prevent image click
          prevSlide();
        }}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full text-white"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation(); // 👈 prevent image click
          nextSlide();
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full text-white"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 flex justify-center gap-2 w-full">
        {eventsData.map((_, idx) => (
          <div
            key={idx}
            onClick={(e) => {
              e.stopPropagation(); // 👈 prevent click bubbling
              setCurrentIndex(idx);
            }}
            className={`h-2.5 w-2.5 rounded-full cursor-pointer transition ${
              idx === currentIndex ? "bg-white" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Slideshow;
