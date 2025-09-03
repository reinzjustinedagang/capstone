import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import { Trash2, Loader2 } from "lucide-react";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeletedModal, setShowDeletedModal] = useState(false);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/events/event`, {
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

  // Delete event
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    setLoading(true);

    try {
      await axios.delete(`${backendUrl}/api/events/${selectedEvent.id}`, {
        withCredentials: true,
      });
      await fetchEvents();
      setShowDeleteModal(false);
      setShowDeletedModal(true);
      setSelectedEvent(null);
    } catch (err) {
      console.error("Failed to delete event:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">Events</h1>

      {events.length === 0 ? (
        <p className="text-gray-500">No events available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
            >
              {/* Image Container with aspect ratio */}
              <div className="relative w-full aspect-[4/3] bg-gray-100">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-500">
                    No Image
                  </div>
                )}

                {/* Delete Button */}
                <button
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-500 hover:text-red-600 p-2 rounded-full shadow"
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowDeleteModal(true);
                  }}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-grow">
                <p className="text-sm text-gray-600 mb-1">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <h3 className="text-base font-semibold text-gray-900 mb-2 truncate">
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !loading && setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        <div className="p-6">
          <p className="mb-4 text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-red-600">
              {selectedEvent?.title || "this event"}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteEvent}
              disabled={loading}
              icon={
                loading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )
              }
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Deleted Success Modal */}
      <Modal
        isOpen={showDeletedModal}
        onClose={() => setShowDeletedModal(false)}
        title=""
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Deleted</h3>
          <p className="text-sm text-gray-600 mb-4">
            The event has been deleted successfully!
          </p>
          <Button variant="primary" onClick={() => setShowDeletedModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default EventList;
