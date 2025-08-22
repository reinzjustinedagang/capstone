import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import slider4 from "../../../assets/slider4.jpg";

// Example announcements/events (later you can fetch from backend)
const eventsData = [];

const Slideshow = () => {
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 5s
  useEffect(() => {
    if (eventsData.length === 0) return; // prevent errors if no events
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % eventsData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
        className="relative h-[60vh] md:h-[70vh] flex items-center justify-center bg-gray-200"
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

  // Normal slideshow
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? eventsData.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % eventsData.length);
  };

  return (
    <section className="relative h-[70vh] md:h-[60vh] flex items-center justify-center overflow-hidden rounded-xl shadow-lg my-6 mx-4">
      {/* Slide */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${eventsData[currentIndex].image})`,
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 rounded-xl" />
      {/* Content */}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full text-white"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full text-white"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 flex justify-center gap-2 w-full">
        {eventsData.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentIndex(idx)}
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
