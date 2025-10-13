import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Modal from "../../UI/Modal";
import { ChevronLeft, ChevronRight, Loader2, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Events = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [canScroll, setCanScroll] = useState(false); // ✅ Added state
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/events/`);
        setEvents(res.data);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [backendUrl]);

  const openModal = (event) => setSelectedEvent(event);
  const closeModal = () => setSelectedEvent(null);

  // ✅ Check if the container is scrollable
  const checkScrollable = () => {
    const container = scrollRef.current;
    if (container) {
      setCanScroll(container.scrollWidth > container.clientWidth);
    }
  };

  useEffect(() => {
    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [events]);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (container) {
      const scrollAmount =
        direction === "left" ? -container.clientWidth : container.clientWidth;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white py-8 relative">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-center items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
            Events
          </h2>
        </div>

        {/* Loading / Empty State */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            <p className="ml-3 text-gray-600 animate-pulse">
              Loading Events...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-2xl font-semibold mb-4">No events posted</p>
            <p>Check back later for the latest news and updates.</p>
          </div>
        ) : (
          <div className="relative">
            {/* ✅ Left Arrow (show only if scrollable) */}
            {canScroll && (
              <button
                onClick={() => scroll("left")}
                className="absolute -left-6 top-1/2 -translate-y-1/2 p-2 z-10"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
            )}

            {/* Scrollable Container */}
            <div
              ref={scrollRef}
              onScroll={checkScrollable}
              className={`flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth px-2 ${
                events.length < 5 ? "justify-center" : ""
              }`}
            >
              {events.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="min-w-[260px] max-w-[280px] bg-gradient-to-br from-blue-50 to-white
                             border border-blue-200 rounded-xl shadow-md cursor-pointer
                             hover:shadow-lg hover:-translate-y-1 transition-transform flex-shrink-0 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative w-full h-40">
                    <img
                      src={
                        event.image_url ||
                        "https://placehold.co/300x200?text=Events"
                      }
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      {/* <Calendar className="w-5 h-5 text-blue-600" /> */}
                      <h3 className="text-lg font-semibold line-clamp-2 text-gray-900">
                        {event.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {event.description}
                    </p>

                    {/* Footer Tag with Event Date */}
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* ✅ Right Arrow (show only if scrollable) */}
            {canScroll && (
              <button
                onClick={() => scroll("right")}
                className="absolute -right-6 top-1/2 -translate-y-1/2 p-2 z-10"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            )}
          </div>
        )}

        {/* Footer Links */}
        <div className="flex flex-col sm:flex-row justify-center items-center mt-8 gap-4 text-sm text-gray-700">
          <Link to="/events" className="underline hover:text-blue-700">
            See more...
          </Link>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={closeModal}
        title={selectedEvent?.title}
      >
        {selectedEvent && (
          <div>
            <img
              src={selectedEvent.image_url || "https://placehold.co/600x400"}
              alt={selectedEvent.title}
              className="w-full h-full object-cover rounded-lg mb-4"
            />
            <p className="text-sm text-gray-600 mb-2">
              {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-gray-700">{selectedEvent.description}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Events;
