import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "../UI/Button";
import AddEvent from "./AddEvent";
import Modal from "../UI/Modal";
import {
  CalendarDays,
  ImageIcon,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

// This component manages the display, addition, and deletion of events.
// It receives a prop `eventRefresh` to notify the parent component when an event is changed.
const Events = () => {
  // States to manage modal visibility
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  // New state for showing error modals and storing the error message
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // States to manage event data and loading
  const [eventList, setEventList] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  // State for filtering events
  const [filter, setFilter] = useState("all");

  // State for new event form data
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    image: null,
    preview: null,
  });

  // Backend URL from environment variables
  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // useEffect to fetch events when the component first mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  // New useEffect to handle filtering whenever the event list or filter changes
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day for accurate comparison

    let tempEvents = [...eventList];

    if (filter === "upcoming") {
      tempEvents = tempEvents.filter((event) => new Date(event.date) >= today);
    } else if (filter === "past") {
      tempEvents = tempEvents.filter((event) => new Date(event.date) < today);
    } else if (filter === "month") {
      tempEvents = tempEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getMonth() === today.getMonth() &&
          eventDate.getFullYear() === today.getFullYear()
        );
      });
    }

    setFilteredEvents(tempEvents);
  }, [eventList, filter]);

  // Function to fetch all events from the backend API
  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/events`);
      setEventList(res.data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  // Handler for input changes in the add event form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewEvent((prev) => ({
        ...prev,
        image: file,
        preview: URL.createObjectURL(file),
      }));
    }
  };

  // Handler for adding a new event
  const handleAddEvent = async () => {
    if (loading) return;
    const { title, description, date, image } = newEvent;

    // Show a modal with an error message if fields are missing
    if (!title || !description || !date || !image) {
      setErrorMessage("All fields including an image are required!");
      setShowErrorModal(true);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("image", image);

      await axios.post(`${backendUrl}/api/events/`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchEvents();

      closeModal(); // Close the add event modal
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to add event:", err);
      // Show a modal for failed operation
      setErrorMessage("Failed to add event. Please try again.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Handler for deleting an event
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    setLoading(true);

    try {
      await axios.delete(`${backendUrl}/api/events/${selectedEvent.id}`, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchEvents(); // Re-fetch events to update the list

      setShowDeleteModal(false); // Close delete confirmation modal
      setShowDeletedModal(true); // Show deletion success modal
      setSelectedEvent(null); // Clear the selected event
    } catch (err) {
      console.error("Failed to delete event:", err);
      // Show a modal for failed operation
      setErrorMessage("Failed to delete event. Please try again.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to close the add event modal and reset the form
  const closeModal = () => {
    setShowAddModal(false);
    setNewEvent({
      title: "",
      description: "",
      date: "",
      image: null,
      preview: null,
    });
  };

  return (
    <div>
      {/* Top Controls (outside white card) */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="filter" className="text-sm font-medium text-gray-700">
            Filter:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4 mr-2" />}
          onClick={() => setShowAddModal(true)}
        >
          Add New Event
        </Button>
      </div>
      {/* White Card Content (matches Benefits layout) */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          {filteredEvents.length > 0 ? (
            <div className="p-6">
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-gray-100 rounded-xl shadow-md overflow-hidden flex flex-col h-full"
                    >
                      {/* Image */}
                      {event.image_url && (
                        <div className="relative">
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-48 object-cover"
                          />
                          {/* Delete button */}
                          <button
                            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-red-500 hover:text-red-600 p-2 rounded-full shadow"
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-4 flex flex-col justify-between flex-grow">
                        <div>
                          <p className="text-sm text-gray-600 mb-1 flex items-center">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-3">
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
              ) : (
                <div className="text-center text-gray-500 p-6 bg-gray-50 rounded-lg">
                  No events available
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 p-6 bg-gray-50 rounded-lg">
              No events available
            </div>
          )}
        </div>
      </div>
      {/* Modals */}
      <Modal isOpen={showAddModal} onClose={closeModal} title="Add New Event">
        <AddEvent
          newEvent={newEvent}
          onInputChange={handleInputChange}
          onImageChange={handleImageChange}
          onSubmit={handleAddEvent}
          loading={loading}
        />
      </Modal>
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
            Event Posted Successfully
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            The new event has been posted successfully!
          </p>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
      <Modal
        isOpen={showDeletedModal}
        onClose={() => setShowDeletedModal(false)}
        title=""
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Delete</h3>
          <p className="text-sm text-gray-600 mb-4">
            The event has been deleted successfully!
          </p>
          <Button variant="primary" onClick={() => setShowDeletedModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Operation Failed
          </h3>
          <p className="text-sm text-gray-600 mb-4">{errorMessage}</p>
          <Button variant="primary" onClick={() => setShowErrorModal(false)}>
            Close
          </Button>
        </div>
      </Modal>{" "}
    </div>
  );
};

export default Events;
