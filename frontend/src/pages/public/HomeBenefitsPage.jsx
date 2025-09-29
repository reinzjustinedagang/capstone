import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../../components/UI/Modal";
import Header from "../../components/startPage/layout/Header";

export const HomeBenefitsPage = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBenefit, setSelectedBenefit] = useState(null);

  useEffect(() => {
    const fetchBenefits = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/benefits/allbenefits`);
        console.log("Benefits fetched:", res.data); // check here
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

  return (
    <>
      <div className="bg-white py-10">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Benefits
          </h1>

          {loading ? (
            <div className="text-center py-16 text-gray-500">
              <p>Loading benefits...</p>
            </div>
          ) : benefits.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-2xl font-semibold mb-4">
                No benefits available
              </p>
              <p>Check back later for new benefits and offers.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  onClick={() => openModal(benefit)}
                  className="bg-gray-100 rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
                >
                  <img
                    src={benefit.image_url || "https://placehold.co/600x400"}
                    alt={benefit.type}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-1 capitalize">
                      {benefit.type === "national"
                        ? "National Benefits"
                        : "Local Benefits"}
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
          )}
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
                src={
                  selectedBenefit.image_url || "https://placehold.co/600x400"
                }
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
    </>
  );
};
