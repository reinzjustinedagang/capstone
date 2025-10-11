import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Cake,
  Crown,
  Loader2,
  SendIcon,
  XCircle,
  CheckCircle,
} from "lucide-react";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import Card from "../UI/Card";

const Notification = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");

  // For SMS sending
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

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

  const handleOpenSMSModal = (citizen) => {
    setSelectedCitizen(citizen);
    setMessageText(
      `Happy ${citizen.age}th Birthday, ${citizen.name}! 🎉 Wishing you good health and happiness always.`
    );
    setShowSMSModal(true);
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
              <Cake className="inline-block h-4 w-4 mr-2 text-pink-500" />
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
              <Crown className="inline-block h-4 w-4 mr-2 text-yellow-600" />
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
                <Card key={notif.id} className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {notif.type === "centenarian" ? (
                        <Crown className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <Cake className="h-5 w-5 text-pink-500" />
                      )}
                      <h3 className="text-gray-800 font-medium">
                        {notif.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Barangay:{" "}
                      <span className="font-medium">{notif.barangay}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Age: <span className="font-medium">{notif.age}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Birthdate:{" "}
                      <span className="font-medium">{notif.birthdate}</span>
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenSMSModal(notif)}
                      icon={<SendIcon className="h-4 w-4 mr-1" />}
                    >
                      Send Message
                    </Button>
                  </div>
                </Card>
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
        <div className="p-4 space-y-4">
          <textarea
            rows={5}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          />
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
