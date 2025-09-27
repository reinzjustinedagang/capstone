import React, { useState, useEffect, useCallback } from "react";
import {
  PlusIcon,
  Loader2,
  CheckCircle,
  XCircle,
  SaveIcon,
  TrashIcon,
} from "lucide-react";
import OrgCard from "./card/OrgCard";

import axios from "axios";

const OrgChart = () => {
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [crudLoading, setCrudLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Separate positions by hierarchy
  const president = positions.find((p) => p.type === "top");
  const vicePresident = positions.find((p) => p.type === "mid");
  const members = positions.filter((p) => p.type === "bottom");

  const fetchPositions = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await axios.get(
        `${backendUrl}/api/officials/orgchart-public`,
        {
          withCredentials: true,
        }
      );
      setPositions(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load organizational chart. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-700">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500 mr-3" />
        <p>Loading organizational chart...</p>
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
      ) : positions.length === 0 ? (
        <p className="col-span-full text-center text-gray-600 py-4">
          No Organization officer found.
        </p>
      ) : null}

      {/* Organizational Chart */}
      <div className="flex flex-col items-center space-y-0">
        {president && (
          <OrgCard
            position={president}
            onEdit={() => openEditModal(president)}
            onDelete={() => openDeleteConfirmation(president)}
            isTop
            backendUrl={backendUrl}
          />
        )}

        {vicePresident && (
          <>
            <div className="w-0.5 h-6 bg-blue-400"></div>
            <OrgCard
              position={vicePresident}
              onEdit={() => openEditModal(vicePresident)}
              onDelete={() => openDeleteConfirmation(vicePresident)}
              backendUrl={backendUrl}
            />
          </>
        )}

        {members.length > 0 && (
          <>
            <div className="relative flex justify-center items-center w-full mb-5">
              <div className="w-0.5 h-6 bg-blue-400"></div>
              <div className="absolute top-6 h-0.5 w-3/4 bg-blue-400"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full place-items-center">
              {members.map((m) => (
                <OrgCard
                  key={m.id}
                  position={m}
                  onEdit={() => openEditModal(m)}
                  onDelete={() => openDeleteConfirmation(m)}
                  backendUrl={backendUrl}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default OrgChart;
