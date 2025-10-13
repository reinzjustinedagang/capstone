import React, { useEffect, useState } from "react";
import axios from "axios";
import { Cake, CalendarDays, Loader2 } from "lucide-react";

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

  // Fetch celebrants for a month
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
        console.error("Error fetching monthly birthdays:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthlyBirthdays();
  }, [selectedMonth, backendUrl]);

  // Group seniors by day
  const grouped = birthdays.reduce((acc, person) => {
    const day = new Date(person.birthdate).getDate();
    if (!acc[day]) acc[day] = [];
    acc[day].push(person);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          Birthday Calendar
        </h2>

        <select
          className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
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

      {loading ? (
        <div className="flex justify-center items-center py-8 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading birthdays...
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-gray-500 text-center py-6">
          No birthdays found for {months[selectedMonth]}.
        </p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => a - b)
            .map(([day, seniors]) => (
              <div key={day} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">
                  📅 {months[selectedMonth]} {day}
                </h3>
                <ul className="space-y-2">
                  {seniors.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between bg-blue-50 rounded-md px-3 py-2"
                    >
                      <span className="flex items-center gap-2">
                        <Cake className="w-4 h-4 text-pink-500" />
                        <span className="font-medium text-gray-800">
                          {s.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({s.age} yrs, {s.barangay})
                        </span>
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(s.birthdate).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default BirthdayCalendar;
