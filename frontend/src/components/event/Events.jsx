import React, { useState } from "react";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import { Calendar, Plus, CheckCircle, LucideImagePlay } from "lucide-react";
import AddEvent from "./AddEvent";
import EventList from "./EventList";
import EventSlideshow from "./EventSlideshow";

const Events = () => {
  const [activeTab, setActiveTab] = useState("eventlist");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // This function handles the edit action from any BenefitsCard
  const handleEdit = (id) => {
    setSelectedBenefitId(id); // Set the ID of the benefit to be updated
    setActiveTab("updatebenefits"); // Switch to the update tab
  };

  const handleAddedSuccess = () => {
    setActiveTab("eventlist");
    setSelectedEventId(null);
    setShowSuccessModal(true);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-end sm:items-center mb-4">
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4 mr-2" />}
          onClick={() => setActiveTab("addevent")}
        >
          Add New Event
        </Button>
      </div>

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
          {/* Pass the handleEdit function as a prop to the components that render BenefitsCards */}
          {activeTab === "eventlist" && <EventList />}
          {activeTab === "slideshow" && <EventSlideshow />}
          {activeTab === "addevent" && (
            <AddEvent onEventAdded={handleAddedSuccess} />
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
            New Event Added Successfully!
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
