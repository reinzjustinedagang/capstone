import React, { useEffect, useState } from "react";
import axios from "axios";
import { Cake, CalendarDays, Loader2, XCircle } from "lucide-react";
import Modal from "../UI/Modal";

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

  const today = new Date();

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
        console.log("Fetched birthdays:", data);
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

  console.log("Grouped birthdays:", grouped);

  // Calendar setup
  const year = new Date().getFullYear();
  const firstDay = new Date(year, selectedMonth, 1).getDay();
  const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate();

  const openDayModal = (day) => {
    if (grouped[day] && grouped[day].length > 0) {
      setSelectedDay(day);
      setShowModal(true);
    } else {
      console.log(`No birthdays on ${months[selectedMonth]} ${day}`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDay(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center gap-2 justify-end mb-4">
        <label className="font-semibold text-sm">Month:</label>
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

      {/* Calendar */}
      {loading ? (
        <div className="flex justify-center items-center py-10 text-gray-600">
          <Loader2 className="animate-spin mr-2 h-5 w-5" />
          Loading birthdays...
        </div>
      ) : (
        <div>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-sm text-center font-medium text-gray-600 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
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
                  className={`relative cursor-pointer rounded-lg p-2 border text-sm transition
                    ${
                      hasBirthday
                        ? "border-blue-400 bg-blue-50 hover:bg-blue-100"
                        : "border-gray-200 hover:bg-gray-50"
                    }
                    ${isToday ? "ring-2 ring-blue-500 font-bold" : ""}
                  `}
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

      {/* Birthday Modal */}
      {showModal && selectedDay && (
        <Modal
          onClose={closeModal}
          isOpen={showModal}
          title={
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Cake className="w-5 h-5 text-blue-500" />
              {months[selectedMonth]} {selectedDay} Birthdays
            </h3>
          }
        >
          <div className="p-4 max-w-md">
            <div className="flex justify-between items-center"></div>

            {grouped[selectedDay]?.length > 0 ? (
              <ul className="space-y-2">
                {grouped[selectedDay].map((s) => (
                  <li
                    key={s.id}
                    className=" border border-blue-200 rounded-md px-3 py-2 flex justify-between"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-800">
                        {s.name}
                      </span>
                      <span className="text-sm text-gray-700 ml-2">
                        ({s.age} yrs, {s.barangay})
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(s.birthdate).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
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
