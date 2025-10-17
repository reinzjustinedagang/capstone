import React, { useEffect, useState } from "react";
import axios from "axios";
import { Cake, Loader2, SendIcon, XCircle, CheckCircle } from "lucide-react";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import NotificationCard from "./NotificationCard";

const Notification = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");

  // Templates
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  // For SMS sending
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [sentMessages, setSentMessages] = useState([]);

  useEffect(() => {
    // Count all today's and tomorrow's celebrants
    const activeCount = notifications.filter(
      (n) => n.day === "today" || n.day === "tomorrow"
    ).length;

    // Save it to localStorage
    localStorage.setItem("activeNotifications", activeCount);
  }, [notifications]);

  useEffect(() => {
    // When this page opens, mark notifications as read
    localStorage.setItem("activeNotifications", 0);
  }, []);

  useEffect(() => {
    localStorage.setItem("activeNotifications", 0);
    window.dispatchEvent(new Event("focus")); // 🔄 forces StaffHeader to recheck immediately
  }, []);

  // Fetch celebrants
  useEffect(() => {
    const fetchCelebrants = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${backendUrl}/api/senior-citizens/birthdays`,
          { withCredentials: true }
        );

        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const celebrants = data.map((person) => {
          const birthDate = new Date(person.birthdate);
          const isToday =
            birthDate.getMonth() === today.getMonth() &&
            birthDate.getDate() === today.getDate();
          const isTomorrow =
            birthDate.getMonth() === tomorrow.getMonth() &&
            birthDate.getDate() === tomorrow.getDate();

          let day = isToday ? "today" : isTomorrow ? "tomorrow" : "other";

          return {
            id: person.id,
            name: person.name,
            age: person.age,
            barangay: person.barangay,
            contact: person.contact,
            birthdate: person.birthdate,
            type: person.age >= 100 ? "centenarian" : "birthday",
            day,
          };
        });

        setNotifications(celebrants);
      } catch (error) {
        console.error("Error fetching celebrants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCelebrants();
  }, [backendUrl]);

  // Fetch templates (same as BirthdayCalendar)
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/templates`);
        setTemplates(res.data || []);
      } catch (err) {
        console.error("Failed to load templates:", err);
      }
    };
    fetchTemplates();
  }, [backendUrl]);

  const handleOpenSMSModal = (citizen) => {
    setSelectedCitizen(citizen);
    // Reset template selection when opening
    setSelectedTemplateId("");
    setMessageText(
      `Happy ${citizen.age}th Birthday, ${citizen.name}! 🎉 Wishing you good health and happiness always.`
    );
    setShowSMSModal(true);
  };

  // If user chooses a template from dropdown, load template message
  const handleTemplateChange = async (id) => {
    setSelectedTemplateId(id);
    if (!id) {
      // if cleared, keep default birthday message (or empty)
      setMessageText(
        selectedCitizen
          ? `Happy ${selectedCitizen.age}th Birthday, ${selectedCitizen.name}! 🎉 Wishing you good health and happiness always.`
          : ""
      );
      return;
    }

    try {
      const res = await axios.get(`${backendUrl}/api/templates/${id}`);
      // Expecting template payload to contain `message`
      setMessageText(res.data?.message || "");
    } catch (err) {
      console.error("Failed to load template:", err);
    }
  };

  const handleSendSMS = async () => {
    if (!selectedCitizen?.contact || !messageText) return;
    setSending(true);

    try {
      const res = await axios.post(
        `${backendUrl}/api/sms/send-sms`,
        {
          numbers: [selectedCitizen.contact],
          message: messageText,
        },
        { withCredentials: true }
      );

      const msg = res.data?.message || "Birthday message sent successfully! 🎂";
      setModalMessage(msg);
      setShowSuccessModal(true);
      setShowSMSModal(false);

      // Mark as sent
      setSentMessages((prev) => [...prev, selectedCitizen.id]);
    } catch (err) {
      console.error("Failed to send SMS:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "❌ Failed to send SMS.";
      setModalMessage(msg);
      setShowErrorModal(true);
    } finally {
      setSending(false);
    }
  };

  const filtered =
    activeTab === "today"
      ? notifications.filter((n) => n.day === "today")
      : notifications.filter((n) => n.day === "tomorrow");

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Tabs Header */}
        <div className="border-b border-gray-300">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("today")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "today"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Cake className="inline-block h-4 w-4 mr-2" />
              Today’s Celebrants
            </button>
            <button
              onClick={() => setActiveTab("tomorrow")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "tomorrow"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Cake className="inline-block h-4 w-4 mr-2" />
              Tomorrow’s Celebrants
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-10 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading celebrants...
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-gray-600 text-center mt-6">
              No celebrants {activeTab === "today" ? "today" : "tomorrow"}.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((notif) => (
                <NotificationCard
                  key={notif.id}
                  celebrant={notif}
                  onSend={handleOpenSMSModal}
                  isSent={sentMessages.includes(notif.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 📩 SMS Modal */}
      <Modal
        isOpen={showSMSModal}
        onClose={() => setShowSMSModal(false)}
        title={`Send Message to ${selectedCitizen?.name || ""}`}
      >
        <div className="p-4 space-y-4 max-w-md">
          {/* Template dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Choose Template
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">-- Select a template --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Message textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              rows={5}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 text-right mt-1">
              {messageText.length} / 160 characters
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowSMSModal(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSendSMS}
              disabled={sending || !messageText}
              icon={
                sending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <SendIcon className="h-4 w-4 mr-2" />
                )
              }
            >
              {sending ? "Sending..." : "Send SMS"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ✅ Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-sm text-gray-600 mb-4">{modalMessage}</p>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </div>
      </Modal>

      {/* ❌ Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm text-gray-600 mb-4">{modalMessage}</p>
          <Button variant="primary" onClick={() => setShowErrorModal(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default Notification;
