import React, { useState } from "react";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import { Calendar, Plus, CheckCircle, LucideImagePlay } from "lucide-react";
import AddEvent from "./AddEvent";
import EventList from "./EventList";
import EventSlideshow from "./EventSlideshow";
import UpdateEvent from "./UpdateEvent";

const Events = () => {
  const [activeTab, setActiveTab] = useState("eventlist");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Handle edit button from EventList
  const handleEdit = (id) => {
    setSelectedEventId(id); // store ID of event to update
    setActiveTab("updateevent"); // switch to update tab
  };

  // Success after adding
  const handleAddedSuccess = () => {
    setActiveTab("eventlist");
    setSelectedEventId(null);
    setShowSuccessModal(true);
  };

  // Success after updating
  const handleUpdateSuccess = () => {
    setActiveTab("eventlist");
    setSelectedEventId(null);
    setShowSuccessModal(true);
  };

  return (
    <>
      {/* Add Event Button */}
      <div className="mt-4 mb-4 md:mt-0 flex flex-col sm:flex-row justify-end sm:items-center ">
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4 mr-2" />}
          onClick={() => setActiveTab("addevent")}
        >
          Add Event
        </Button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab("eventlist")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "eventlist"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <Calendar className="inline-block h-4 w-4 mr-2" /> Events
            </button>
            <button
              onClick={() => setActiveTab("slideshow")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === "slideshow"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <LucideImagePlay className="inline-block h-4 w-4 mr-2" />{" "}
              SlideShow
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tabs */}
          {activeTab === "eventlist" && <EventList onEdit={handleEdit} />}
          {activeTab === "slideshow" && <EventSlideshow />}
          {activeTab === "addevent" && (
            <AddEvent
              onEventAdded={handleAddedSuccess}
              onCancel={() => {
                setActiveTab("eventlist");
              }}
            />
          )}
          {activeTab === "updateevent" && selectedEventId && (
            <UpdateEvent
              eventId={selectedEventId}
              onSuccess={handleUpdateSuccess}
              onCancel={() => {
                setActiveTab("eventlist");
              }}
            />
          )}
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Success</h3>
          <p className="text-sm text-gray-600 mb-4">
            {activeTab === "addevent"
              ? "New Event Added Successfully!"
              : "Event Updated Successfully!"}
          </p>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default Events;
