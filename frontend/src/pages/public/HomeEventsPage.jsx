import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../../components/UI/Modal";
import { Home } from "lucide-react";
import Header from "../../components/startPage/layout/Header";

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
    <>
      <div className="bg-white py-10">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => openModal(event)}
                  className="bg-gray-100 rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
                >
                  {/* Image */}
                  <img
                    src={event.image_url || "https://placehold.co/400x250"}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-1">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-700 text-sm line-clamp-3">
                      {event.description}
                    </p>
                  </div>
                </div>
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
    </>
  );
};
