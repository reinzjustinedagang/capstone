import React, { useEffect, useState } from "react";
import {
  Cake,
  Crown,
  CalendarCheck2,
  UsersRound,
  CalendarDays,
  PartyPopper,
} from "lucide-react";

const mockNotifications = [
  {
    id: 1,
    type: "birthday",
    name: "Lola Maria Cruz",
    age: 72,
    date: "2025-06-29",
    message: "It's Lola Maria Cruz's 72nd birthday today!",
  },
  {
    id: 2,
    type: "centenarian",
    name: "Lolo Jose Santos",
    age: 100,
    date: "2025-06-29",
    message: "Lolo Jose Santos turns 100 years old today! 🎉",
  },
  {
    id: 3,
    type: "meeting",
    date: "2025-07-01",
    message:
      "Barangay-wide Senior Meeting scheduled on July 1, 2025 at 10:00 AM.",
  },
  {
    id: 4,
    type: "event",
    date: "2025-07-04",
    message:
      "Health and Wellness Seminar happening this July 4 at Municipal Hall.",
  },
  {
    id: 5,
    type: "anniversary",
    name: "Senior Citizen Day",
    date: "2025-10-01",
    message: "Celebrating National Senior Citizen Day on October 1!",
  },
  {
    id: 6,
    type: "birthday",
    name: "Lolo Pedro Dela Cruz",
    age: 88,
    date: "2025-06-28",
    message: "Yesterday was Lolo Pedro Dela Cruz’s 88th birthday.",
  },
  {
    id: 7,
    type: "meeting",
    date: "2025-07-10",
    message: "Pensioners' Committee meeting on July 10 at 9:00 AM.",
  },
  {
    id: 8,
    type: "event",
    date: "2025-07-15",
    message: "Free Medical Checkup: July 15 at Health Center.",
  },
];

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    // Simulate fetching
    setTimeout(() => {
      setNotifications(mockNotifications);
    }, 500);
  }, []);

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
    if (visibleCount < notifications.length) {
      setVisibleCount(notifications.length);
    } else {
      setVisibleCount(5);
    }
  };

  return (
    <>
      {notifications.length === 0 ? (
        <p className="text-gray-600 text-center mt-10">
          No notifications available.
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
                <p className="text-sm text-gray-500">{notif.date}</p>
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
