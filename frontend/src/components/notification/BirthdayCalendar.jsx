import React, { useEffect, useState } from "react";
import axios from "axios";
import { Cake, Loader2, SendIcon, CheckCircle, XCircle } from "lucide-react";
import Modal from "../UI/Modal";
import Button from "../UI/Button";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const BirthdayCalendar = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [message, setMessage] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const today = new Date();

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

  // Fetch birthdays for selected month
  useEffect(() => {
    const fetchMonthlyBirthdays = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${backendUrl}/api/senior-citizens/birthdays/month/${
            selectedMonth + 1
          }`,
          { withCredentials: true }
        );
        setBirthdays(data);
      } catch (error) {
        console.error("Error fetching birthdays:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthlyBirthdays();
  }, [selectedMonth, backendUrl]);

  // Group birthdays by day
  const grouped = birthdays.reduce((acc, person) => {
    const day = new Date(person.birthdate).getDate();
    if (!acc[day]) acc[day] = [];
    acc[day].push(person);
    return acc;
  }, {});

  // Calendar setup
  const year = today.getFullYear();
  const firstDay = new Date(year, selectedMonth, 1).getDay();
  const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate();

  const openDayModal = (day) => {
    if (grouped[day]?.length) {
      setSelectedDay(day);
      setSelectedRecipients([]); // reset previous selection
      setMessage(""); // reset message
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDay(null);
    setSuccessMsg("");
    setErrorMsg("");
    setSelectedRecipients([]);
    setMessage("");
  };

  const handleSendGreetings = async () => {
    const celebrants = grouped[selectedDay] || [];
    const numbers = celebrants
      .filter((s) => selectedRecipients.includes(s.id))
      .map((s) => s.contact)
      .filter((num) => num !== null && num !== undefined)
      .map((num) => String(num).trim())
      .filter((num) => num !== "");

    if (numbers.length === 0) {
      setErrorMsg("No valid contact numbers selected.");
      return;
    }

    try {
      setSending(true);
      const res = await axios.post(
        `${backendUrl}/api/sms/send-sms`,
        { numbers, message: messageText },
        { withCredentials: true }
      );
      setSuccessMsg(
        res.data?.message || "Birthday greetings sent successfully!"
      );
    } catch (err) {
      console.error("Failed to send greetings:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to send birthday greetings. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  // Automatically open today’s modal if there are birthdays
  useEffect(() => {
    const todayDay = today.getDate();
    if (grouped[todayDay] && grouped[todayDay].length > 0) {
      setSelectedDay(todayDay);
      setShowModal(true);
    }
  }, [birthdays]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {/* Month and Year Header */}
        <h2 className="text-lg font-semibold text-center mb-4">
          {months[selectedMonth]} {year}
        </h2>
        <div>
          <label className="font-semibold text-sm mr-2">Month:</label>
          <select
            className="text-sm border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {months.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="flex justify-center items-center py-10 text-gray-600">
          <Loader2 className="animate-spin text-blue-500 mr-2 h-8 w-8" />
          Loading birthdays...
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-7 text-sm text-center font-medium text-gray-600 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-sm text-center">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday =
                today.getDate() === day &&
                today.getMonth() === selectedMonth &&
                today.getFullYear() === year;

              const hasBirthday = grouped[day];

              return (
                <div
                  key={day}
                  onClick={() => openDayModal(day)}
                  className={`relative cursor-pointer rounded-lg p-2 border transition ${
                    hasBirthday
                      ? "border-blue-400 bg-blue-50 hover:bg-blue-100"
                      : "border-gray-200 hover:bg-gray-50"
                  } ${isToday ? "ring-2 ring-blue-500 font-bold" : ""}`}
                >
                  <div>{day}</div>
                  {hasBirthday && (
                    <Cake className="w-4 h-4 text-blue-500 absolute bottom-1 right-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedDay && (
        <Modal
          onClose={closeModal}
          isOpen={showModal}
          title={
            <div className="text-base font-semibold flex items-center gap-2">
              <Cake className="w-5 h-5 text-blue-500" />
              {months[selectedMonth]} {selectedDay} Birthdays
            </div>
          }
        >
          <div className="p-4 max-w-md space-y-4">
            {grouped[selectedDay]?.length > 0 ? (
              <>
                {/* ✅ Select who to send to */}
                <div className="border rounded-md p-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Select Celebrants
                  </h4>
                  {grouped[selectedDay].map((s) => (
                    <div key={s.id} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        id={`send-${s.id}`}
                        checked={selectedRecipients.includes(s.id)}
                        onChange={() => {
                          setSelectedRecipients((prev) =>
                            prev.includes(s.id)
                              ? prev.filter((id) => id !== s.id)
                              : [...prev, s.id]
                          );
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`send-${s.id}`}
                        className="ml-2 text-sm text-gray-800"
                      >
                        {s.name} ({s.age} yrs, {s.barangay})
                      </label>
                    </div>
                  ))}
                </div>

                {/* ✅ Message input / template */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your birthday greeting here..."
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 text-right mt-1">
                    {messageText.length} / 160 characters
                  </p>
                </div>

                {/* ✅ Template dropdown (optional if you already use template API) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Choose Template
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={async (e) => {
                      const id = e.target.value;
                      setSelectedTemplateId(id);
                      if (!id) return;
                      try {
                        const res = await axios.get(
                          `${backendUrl}/api/templates/${id}`
                        );
                        setMessageText(res.data?.message || "");
                      } catch (err) {
                        console.error("Failed to load template:", err);
                      }
                    }}
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

                {/* ✅ Send button */}
                <div className="flex justify-end mt-4">
                  <Button
                    variant="primary"
                    icon={<SendIcon className="w-4 h-4 mr-2" />}
                    onClick={handleSendGreetings}
                    disabled={
                      sending ||
                      selectedRecipients.length === 0 ||
                      !messageText.trim()
                    }
                  >
                    {sending ? "Sending..." : "Send Birthday Greetings"}
                  </Button>
                </div>

                {successMsg && (
                  <p className="text-green-600 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> {successMsg}
                  </p>
                )}
                {errorMsg && (
                  <p className="text-red-600 text-sm flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> {errorMsg}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No birthdays on this day.
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BirthdayCalendar;
