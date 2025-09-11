import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Modal from "../../UI/Modal";
import { ChevronLeft, ChevronRight, BookOpenTextIcon } from "lucide-react";

const RepublicActs = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [acts, setActs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAct, setSelectedAct] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchActs = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/benefits/front-ra`);
        setActs(res.data);
      } catch (err) {
        console.error("Error fetching Republic Acts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActs();
  }, [backendUrl]);

  const openModal = (act) => setSelectedAct(act);
  const closeModal = () => setSelectedAct(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-white py-8 relative">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-center items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center flex items-center gap-2">
            <BookOpenTextIcon className="w-6 h-6 text-purple-600" />
            Republic Acts
          </h2>
        </div>

        {/* Loading / Empty State */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <p>Loading Republic Acts...</p>
          </div>
        ) : acts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-2xl font-semibold mb-4">
              No Republic Acts posted
            </p>
            <p>Check back later for updates.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Acts Scrollable Row */}
            <div
              ref={scrollRef}
              className={`flex overflow-x-auto scrollbar-hide scroll-smooth px-2 
    ${acts.length === 1 ? "justify-center" : "space-x-4"}`}
            >
              {acts.map((act) => (
                <div
                  key={act.id}
                  onClick={() => openModal(act)}
                  className="min-w-[250px] max-w-[250px] bg-gray-100 rounded-xl shadow-md overflow-hidden flex-shrink-0 cursor-pointer hover:shadow-lg transition p-4"
                >
                  <h3 className="text-base font-semibold text-purple-700 mb-2 line-clamp-2">
                    {act.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {act.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    Enacted:{" "}
                    {new Date(act.enacted_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={!!selectedAct}
        onClose={closeModal}
        title={selectedAct?.title}
      >
        {selectedAct && (
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Enacted on:{" "}
              {new Date(selectedAct.enacted_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-gray-700">{selectedAct.description}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RepublicActs;
