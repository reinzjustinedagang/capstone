import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Cake,
  Crown,
  CalendarCheck2,
  UsersRound,
  CalendarDays,
  PartyPopper,
  Loader2,
} from "lucide-react";

const Notification = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [notifications, setNotifications] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCelebrants = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${backendUrl}/senior-citizens/birthdays`
        );
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        // 🥳 Transform backend data into notification format
        const celebrants = data.map((person) => {
          const birthDate = new Date(person.birthdate);
          const isToday =
            birthDate.getMonth() === today.getMonth() &&
            birthDate.getDate() === today.getDate();
          const isTomorrow =
            birthDate.getMonth() === tomorrow.getMonth() &&
            birthDate.getDate() === tomorrow.getDate();

          let message = "";
          if (isToday) {
            message = `It's ${person.name}'s ${person.age}th birthday today! 🎂`;
          } else if (isTomorrow) {
            message = `${person.name} will turn ${person.age} years old tomorrow! 🎉`;
          }

          return {
            id: person.id,
            type: person.age >= 100 ? "centenarian" : "birthday",
            name: person.name,
            age: person.age,
            date: person.birthdate,
            barangay: person.barangay,
            message,
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

  const getIcon = (type) => {
    switch (type) {
      case "birthday":
        return <Cake className="h-5 w-5 text-pink-500 mr-2" />;
      case "centenarian":
        return <Crown className="h-5 w-5 text-yellow-600 mr-2" />;
      case "meeting":
        return <UsersRound className="h-5 w-5 text-indigo-500 mr-2" />;
      case "event":
        return <CalendarDays className="h-5 w-5 text-teal-500 mr-2" />;
      case "anniversary":
        return <PartyPopper className="h-5 w-5 text-orange-500 mr-2" />;
      default:
        return <CalendarCheck2 className="h-5 w-5 text-gray-500 mr-2" />;
    }
  };

  const handleToggle = () => {
    setVisibleCount((prev) =>
      prev < notifications.length ? notifications.length : 5
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10 text-gray-600">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading notifications...
      </div>
    );
  }

  return (
    <>
      {notifications.length === 0 ? (
        <p className="text-gray-600 text-center mt-10">
          No birthdays today or tomorrow.
        </p>
      ) : (
        <div className="space-y-4">
          {notifications.slice(0, visibleCount).map((notif) => (
            <div
              key={notif.id}
              className="bg-white p-4 rounded-lg shadow flex items-start gap-3 border-l-4 border-blue-500"
            >
              <div className="mt-1">{getIcon(notif.type)}</div>
              <div>
                <p className="text-gray-800 font-medium">{notif.message}</p>
                <p className="text-sm text-gray-500">
                  {notif.barangay} — {notif.date}
                </p>
              </div>
            </div>
          ))}

          {notifications.length > 5 && (
            <div className="text-center mt-4">
              <button
                onClick={handleToggle}
                className="text-blue-600 hover:underline font-medium"
              >
                {visibleCount < notifications.length ? "See more" : "Show less"}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Notification;
