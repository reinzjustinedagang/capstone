import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../UI/Modal";
import { ChevronLeft, ChevronRight, Trash2, CheckCircle } from "lucide-react";

const EventSlideshow = () => {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Fetch events
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

  // Auto-slide
  useEffect(() => {
    if (events.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [events]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  // Delete event
  const handleDelete = async () => {
    if (!eventToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`${backendUrl}/api/events/${eventToDelete}`, {
        withCredentials: true,
      });

      // Re-fetch events from backend instead of just filtering state
      await fetchEvents();

      setCurrentIndex(0); // Reset to first slide for safety
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to delete event:", err);
    } finally {
      setLoading(false);
      setEventToDelete(null);
    }
  };

  const currentEvent = events[currentIndex];

  if (!currentEvent) {
    return (
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center bg-gray-200 rounded-xl shadow-lg mx-4">
        <p className="text-gray-500">No slideshow to display.</p>
      </section>
    );
  }

  return (
    <section className="relative h-[70vh] md:h-[60vh] flex items-center justify-center overflow-hidden rounded-xl shadow-lg mx-4">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${currentEvent.image_url})`,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 rounded-xl" />

      {/* Event info */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center text-white px-6 max-w-2xl">
        <h2 className="text-2xl font-bold">{currentEvent.title}</h2>
        <p className="text-sm mt-2 line-clamp-3">{currentEvent.description}</p>
        <p className="text-xs mt-1">
          {new Date(currentEvent.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>

        {/* Delete button */}
        <button
          onClick={() => {
            setEventToDelete(currentEvent.id);
            setShowConfirmModal(true);
          }}
          className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 mx-auto"
        >
          <Trash2 className="h-4 w-4" />
          Delete Event
        </button>
      </div>

      {/* Navigation buttons */}
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
        {events.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2.5 w-2.5 rounded-full cursor-pointer transition ${
              idx === currentIndex ? "bg-white" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
      {/* Confirm Delete Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Delete Event"
      >
        <div className="mt-4 text-sm text-gray-700">
          Are you sure you want to delete this event?
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleDelete}
            className={`px-4 py-2 rounded text-sm ${
              loading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            } text-white`}
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title=""
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Event Deleted Successfully
          </h3>
          <button
            onClick={() => setShowSuccessModal(false)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            OK
          </button>
        </div>
      </Modal>
    </section>
  );
};

export default EventSlideshow;
