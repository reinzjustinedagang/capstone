import React, { useState, useEffect, useCallback } from "react";
import {
  PlusIcon,
  Loader2,
  CheckCircle,
  XCircle,
  SaveIcon,
  TrashIcon,
} from "lucide-react";
import MunicipalCard from "./card/MunicipalCard";
import axios from "axios";

const MunicipalOfficials = ({ title }) => {
  const [officials, setOfficials] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [crudLoading, setCrudLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const head = officials.find((m) => m.type === "top");
  const vice = officials.find((m) => m.type === "mid");
  const others = officials.filter((m) => m.type === "bottom");

  const fetchOfficials = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await axios.get(
        `${backendUrl}/api/officials/municipal`,
        { withCredentials: true }
      );
      setOfficials(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load municipal officials. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficials();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-700">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500 mr-3" />
        <p>Loading municipal officials...</p>
      </div>
    );
  }

  return (
    <>
      {crudLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          <p className="ml-3 text-gray-600">Processing request...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mx-auto mb-4 flex items-center">
          <XCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      ) : successMessage ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mx-auto mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>{successMessage}</span>
        </div>
      ) : null}

      {!isLoading && !error && (
        <div className="flex flex-col items-center space-y-0">
          {/* Head */}
          {head && (
            <MunicipalCard
              official={head}
              onEdit={() => openEditModal(head)}
              onDelete={() => openDeleteConfirmation(head)}
              isHead
              backendUrl={backendUrl}
            />
          )}

          {/* Vice */}
          {vice && (
            <>
              <div className="w-0.5 h-6 bg-blue-400"></div>
              <MunicipalCard
                official={vice}
                onEdit={() => openEditModal(vice)}
                onDelete={() => openDeleteConfirmation(vice)}
                backendUrl={backendUrl}
              />
            </>
          )}

          {/* Others */}
          {others.length > 0 && (
            <>
              <div className="relative flex justify-center items-center w-full mb-2">
                <div className="w-0.5 h-6 bg-blue-400"></div>
                <div className="absolute top-6 h-0.5 w-2/3 bg-blue-400"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full place-items-center">
                {others.map((o) => (
                  <MunicipalCard
                    key={o.id}
                    official={o}
                    onEdit={() => openEditModal(o)}
                    onDelete={() => openDeleteConfirmation(o)}
                    backendUrl={backendUrl}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default MunicipalOfficials;
