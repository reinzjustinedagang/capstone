import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../../components/UI/Modal";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

export const HomeEventPage = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/events/public-events`);
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

  return (
    <div className="bg-white py-6">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Events
        </h1>

        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-2xl font-semibold mb-4">No events posted</p>
            <p>Check back later for the latest news and updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 
                           rounded-xl shadow-md cursor-pointer hover:shadow-lg 
                           hover:-translate-y-1 transition-transform overflow-hidden"
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
                <div className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold line-clamp-2 text-gray-900">
                        {event.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {event.description}
                    </p>
                  </div>

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
        )}
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
