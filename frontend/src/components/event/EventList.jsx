import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import { Trash2, Loader2, Edit } from "lucide-react";

const EventList = ({ onEdit }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false); // for delete
  const [loadingEvents, setLoadingEvents] = useState(false); // for fetching
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Fetch events from backend
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await axios.get(`${backendUrl}/api/events/event`, {
        withCredentials: true,
      });
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoadingEvents(false);
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
    <div>
      {/* Loading State */}
      {loadingEvents ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-2 text-gray-600">Loading events...</span>
        </div>
      ) : events.length === 0 ? (
        <p className="text-gray-500">No events available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition"
              onClick={() => {
                setSelectedEvent(event);
                setShowDetailModal(true);
              }}
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[4/3] bg-gray-100">
                {/* Pending Badge */}
                {event.approved === 0 && (
                  <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded">
                    Pending
                  </span>
                )}

                <img
                  src={
                    event.image_url ||
                    "https://placehold.co/600x400?text=Events"
                  }
                  alt={event.title}
                  className="w-full h-full object-cover"
                />

                {/* Edit Button */}
                <button
                  className="absolute top-2 right-12 bg-white/90 hover:bg-white text-blue-500 hover:text-blue-600 p-2 rounded-full shadow z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(event.id); // ✅ pass the whole event object
                  }}
                >
                  <Edit className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-500 hover:text-red-600 p-2 rounded-full shadow z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                    setShowDeleteModal(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-grow relative">
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

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedEvent?.title}
      >
        {selectedEvent && (
          <div>
            <img
              src={selectedEvent.image_url || "https://placehold.co/600x400"}
              alt={selectedEvent.title}
              className="w-full h-64 object-cover rounded-lg mb-4"
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
