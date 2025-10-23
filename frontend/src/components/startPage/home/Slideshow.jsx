import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";

const Slideshow = () => {
  const location = useLocation();
  const [eventsData, setEventsData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Fetch slideshow events
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

  // Auto-slide
  useEffect(() => {
    if (eventsData.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % eventsData.length);
    }, 10000);
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

  // Navigation
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? eventsData.length - 1 : prev - 1));
  };
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % eventsData.length);
  };

  // Swipe handlers
  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchMove = (e) => setTouchEndX(e.touches[0].clientX);
  const handleTouchEnd = () => {
    const deltaX = touchStartX - touchEndX;
    const threshold = 50;
    if (deltaX > threshold) nextSlide();
    else if (deltaX < -threshold) prevSlide();
  };

  if (eventsData.length === 0) {
    return (
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gray-200" />
      </section>
    );
  }

  return (
    <section
      className="relative h-[70vh] md:h-[70vh] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide container */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {eventsData.map((slide, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-full h-full bg-center bg-cover"
            style={{ backgroundImage: `url(${slide.image_url})` }}
            onClick={() => window.open(slide.image_url, "_blank")}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-white z-10"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white z-10"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 flex justify-center gap-2 w-full z-10">
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
