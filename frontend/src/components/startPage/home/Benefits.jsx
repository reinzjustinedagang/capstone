import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Modal from "../../UI/Modal";
import { ChevronLeft, ChevronRight } from "lucide-react"; // ✅ Arrow icons

const Benefits = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchBenefits = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/benefits/`);
        setBenefits(res.data);
      } catch (err) {
        console.error("Error fetching benefits:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBenefits();
  }, [backendUrl]);

  const openModal = (benefit) => setSelectedBenefit(benefit);
  const closeModal = () => setSelectedBenefit(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white py-8 rounded-lg relative">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-center md:items-center mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">
            Latest Benefits
          </h2>
        </div>

        {/* Loading / Empty State */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <p>Loading benefits...</p>
          </div>
        ) : benefits.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-2xl font-semibold mb-4">No benefits available</p>
            <p>Check back later for new benefits and offers.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={scrollLeft}
              className="absolute -left-6 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-gray-100"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            {/* Scrollable Container */}
            <div
              ref={scrollRef}
              className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth px-2"
            >
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  onClick={() => openModal(benefit)}
                  className="min-w-[250px] max-w-[250px] bg-gray-100 rounded-xl shadow-md overflow-hidden flex-shrink-0 cursor-pointer hover:shadow-lg transition"
                >
                  {/* Placeholder Image */}
                  <div className="relative">
                    <img
                      src={benefit.image_url || "https://placehold.co/600x400"}
                      alt={benefit.type}
                      className="w-full h-40 object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-1 capitalize">
                      {benefit.type}
                    </p>
                    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                      {benefit.provider}
                    </h3>
                    <p className="text-gray-700 text-sm line-clamp-3">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={scrollRight}
              className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-gray-100"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        )}

        {/* Footer Links */}
        <div className="flex flex-col sm:flex-row justify-center items-center mt-8 gap-4 text-sm text-gray-700">
          <a href="#" className="underline hover:text-blue-700">
            Click here to explore more benefits...
          </a>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={!!selectedBenefit}
        onClose={closeModal}
        title={selectedBenefit?.provider}
      >
        {selectedBenefit && (
          <div>
            <img
              src={selectedBenefit.image_url || "https://placehold.co/600x400"}
              alt={selectedBenefit.type}
              className="w-full h-full object-cover rounded-lg mb-4"
            />
            <p className="text-sm text-gray-600 mb-2 capitalize">
              Type: {selectedBenefit.type}
            </p>
            <p className="text-gray-700">{selectedBenefit.description}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Benefits;
