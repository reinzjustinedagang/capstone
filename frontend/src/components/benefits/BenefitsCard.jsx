import React, { useState } from "react";
import { Info, Edit, Trash2, Loader2 } from "lucide-react";
import Modal from "../UI/Modal";
import axios from "axios";

const BenefitsCard = ({
  type,
  icon = <Info className="w-5 h-5 text-blue-500" />,
  textColor = "text-blue-700",
  onEdit,
  onDelete,
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [error, setError] = useState("");

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const fetchRecipientsWithNames = async () => {
    try {
      setLoadingRecipients(true);
      setError("");

      // Fetch all recipients for this benefit
      const recipientsRes = await axios.get(
        `${backendUrl}/api/benefits/${type.id}/recipients`,
        { withCredentials: true }
      );

      // Fetch all senior citizens
      const seniorsRes = await axios.get(
        `${backendUrl}/api/senior-citizens/all`,
        {
          withCredentials: true,
        }
      );

      const seniors = seniorsRes.data; // Array of senior citizens
      const recipientsData = recipientsRes.data;

      // Map recipient senior_id to senior full name
      const recipientsWithNames = recipientsData.map((r) => {
        const senior = seniors.find((s) => s.id === r.senior_id);
        return {
          ...r,
          name: senior
            ? `${senior.lastName}, ${senior.firstName} ${
                senior.middleName ? senior.middleName[0] + "." : ""
              }`
            : `Unknown (ID: ${r.senior_id})`,
        };
      });

      setRecipients(recipientsWithNames);
    } catch (err) {
      console.error("Failed to fetch recipients with names:", err);
      setError("Failed to load recipients");
      setRecipients([]);
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleOpenModal = () => {
    setShowDetailModal(true);
    fetchRecipientsWithNames();
  };

  return (
    <>
      {/* Card */}
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition"
        onClick={handleOpenModal}
      >
        {/* Image */}
        <div className="relative w-full aspect-[4/3] bg-gray-100">
          <img
            src={type.image_url || "https://placehold.co/600x600?text=Benefits"}
            alt={type.title}
            className="w-full h-full object-cover"
          />

          {type.approved === 0 && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded">
              Pending
            </span>
          )}

          <div className="absolute top-2 right-2 flex gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit(type.id);
              }}
              className="bg-white/90 hover:bg-white text-blue-500 hover:text-blue-700 p-2 rounded-full shadow"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(type.id);
              }}
              className="bg-white/90 hover:bg-white text-red-500 hover:text-red-700 p-2 rounded-full shadow"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-base font-semibold text-gray-900 mb-2 truncate">
            {type.title}
          </h3>
          <p
            className={`text-sm flex items-center gap-2 ${textColor}`}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {type.description}
          </p>
          {type.provider && (
            <div className="text-xs text-gray-400 mt-1">
              Provided by: {type.provider}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={type.title || "Benefit Details"}
      >
        <div className="space-y-4">
          {type.image_url && (
            <img
              src={type.image_url}
              alt={type.title || "Benefit Image"}
              className="w-full h-64 object-cover rounded-lg"
            />
          )}
          <p className="text-gray-700 text-sm">{type.description}</p>
          {type.provider && (
            <p className="text-xs text-gray-500">
              Provided by: {type.provider}
            </p>
          )}

          <hr />

          <h4 className="font-semibold text-gray-800">Recipients</h4>
          {loadingRecipients ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading recipients...
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : recipients.length === 0 ? (
            <p className="text-gray-500 text-sm">No recipients yet.</p>
          ) : (
            <ul className="list-disc list-inside text-sm text-gray-700 max-h-40 overflow-y-auto">
              {recipients.map((r) => (
                <li key={r.senior_id}>
                  {r.name}, Received on:{" "}
                  {new Date(r.received_date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    </>
  );
};

export default BenefitsCard;
