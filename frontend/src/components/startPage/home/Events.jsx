import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../../UI/Modal"; // ✅ Import your Modal

const Events = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null); // For modal

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

  return (
    <div className="bg-white py-8 rounded-lg shadow-md">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-center md:items-center mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">
            Latest Events
          </h2>
        </div>

        {/* Loading / Empty State */}
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
          /* Events Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => openModal(event)}
                className="bg-gray-100 rounded-xl shadow-md overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-lg transition"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={event.image_url || "https://placehold.co/300x200"}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
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
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Links */}
        <div className="flex flex-col sm:flex-row justify-center items-center mt-8 gap-4 text-sm text-gray-700">
          <a href="#" className="underline hover:text-blue-700">
            Click here to read more news items...
          </a>
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
