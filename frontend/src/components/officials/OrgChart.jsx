import React, { useState, useEffect, useCallback } from "react";
import {
  PlusIcon,
  Loader2,
  CheckCircle,
  XCircle,
  SaveIcon,
  TrashIcon,
} from "lucide-react";
import OrgForm from "./form/OrgForm";
import OrgCard from "./card/OrgCard";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import axios from "axios";

const OrgChart = () => {
  const [positions, setPositions] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "",
    id: null,
    payload: null,
  });
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    type: "bottom",
    existingImage: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [crudLoading, setCrudLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedPosition, setSelectedPosition] = useState(null);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Separate positions by hierarchy
  const president = positions.find((p) => p.type === "top");
  const vicePresident = positions.find((p) => p.type === "mid");
  const members = positions.filter((p) => p.type === "bottom");

  const isPresidentOccupied = !!president;
  const isViceOccupied = !!vicePresident;

  const fetchPositions = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await axios.get(`${backendUrl}/api/officials/orgchart`, {
        withCredentials: true,
      });
      setPositions(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load organizational chart. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
    const allowedExtensions = ["jpg", "jpeg", "png"];
    const maxSizeInBytes = 10 * 1024 * 1024;

    const fileType = file.type.toLowerCase();
    const fileExtension = file.name.toLowerCase().split(".").pop();

    if (!allowedMimeTypes.includes(fileType)) {
      setError("Only JPEG, JPG, and PNG files are allowed.");
      return;
    }

    if (!allowedExtensions.includes(fileExtension)) {
      setError("Only .jpeg, .jpg, and .png file extensions are allowed.");
      return;
    }

    if (file.size > maxSizeInBytes) {
      setError("File size exceeds 10MB. Please select a smaller image.");
      return;
    }

    setError(null);
    setImageFile(file);
    setFormData((prev) => ({ ...prev, imageFile: file }));
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setFormData({
      name: "",
      position: "",
      type: "",
      existingImage: "",
    });
    setImageFile(null);
    setEditingId(null);
    setError("");
  };

  const handleSubmitForm = async () => {
    setError("");
    if (
      !formData.name.trim() ||
      !formData.position.trim() ||
      !formData.type.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (editingId) {
      setConfirmModal({
        open: true,
        type: "save-update",
        id: editingId,
        payload: { ...formData, imageFile },
      });
    } else {
      await savePosition(formData, imageFile);
    }
  };

  const savePosition = async (dataToSave, fileToUpload) => {
    setCrudLoading(true);
    setError("");
    setSuccessMessage("");

    if (
      !dataToSave.name?.trim() ||
      !dataToSave.position?.trim() ||
      !dataToSave.type?.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      const form = new FormData();
      form.append("name", dataToSave.name);
      form.append("position", dataToSave.position);
      form.append("type", dataToSave.type);

      if (dataToSave.id && dataToSave.existingImage) {
        form.append("existing_image", dataToSave.existingImage || "");
      }

      if (fileToUpload) form.append("image", fileToUpload);

      if (dataToSave.id) {
        await axios.put(
          `${backendUrl}/api/officials/orgchart/${dataToSave.id}`,
          form,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setSuccessMessage("Position updated successfully!");
      } else {
        await axios.post(`${backendUrl}/api/officials/orgchart`, form, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccessMessage("New position added successfully!");
      }

      closeFormModal();
      fetchPositions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save position. Please try again."
      );
    } finally {
      setCrudLoading(false);
    }
  };

  const openAddModal = () => {
    // Change `type: ""` to a default value like `type: "bottom"`
    setFormData({
      name: "",
      position: "",
      type: "bottom", // ✅ SET A DEFAULT VALUE HERE
      existingImage: "",
    });
    setImageFile(null);
    setEditingId(null);
    setShowFormModal(true);
  };

  const openEditModal = (pos) => {
    setSelectedPosition(pos);
    setFormData({
      name: pos.name,
      position: pos.position,
      type: pos.type,
      existingImage: pos.image || "",
    });
    setImageFile(null);
    setEditingId(pos.id);
    setShowFormModal(true);
  };

  const openDeleteConfirmation = (pos) => {
    setSelectedPosition(pos);
    setConfirmModal({
      open: true,
      type: "delete",
      id: pos.id,
      payload: null,
    });
  };

  const handleConfirmAction = async () => {
    if (confirmModal.type === "delete" && confirmModal.id) {
      setCrudLoading(true);
      setError("");
      setSuccessMessage("");
      try {
        await axios.delete(
          `${backendUrl}/api/officials/orgchart/${confirmModal.id}`,
          {
            withCredentials: true,
          }
        );
        setSuccessMessage("Position deleted successfully!");
        fetchPositions();
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to delete position. Please try again."
        );
      } finally {
        setCrudLoading(false);
        setConfirmModal({ open: false, type: "", id: null, payload: null });
      }
    } else if (confirmModal.type === "save-update" && confirmModal.payload) {
      await savePosition(
        { ...confirmModal.payload, id: confirmModal.id },
        confirmModal.payload.imageFile
      );
      setConfirmModal({ open: false, type: "", id: null, payload: null });
    }
  };

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
      <div className="flex justify-end items-center pb-4 mb-6">
        <Button
          onClick={openAddModal}
          variant="primary"
          icon={<PlusIcon className="h-4 w-4 mr-2" />}
        >
          Add New Official in Organizational Chart
        </Button>
      </div>

      {crudLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          <p className="ml-3 text-gray-600">Processing request...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mx-auto mb-4 flex items-center">
          <XCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mx-auto mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Organizational Chart */}
      <div className="flex flex-col items-center space-y-0">
        {positions.length === 0 && !isLoading && (
          <p className="text-gray-500 mt-6">
            No positions have been added yet. Click "Add New Position" to get
            started.
          </p>
        )}

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
            <div className="relative flex justify-center items-center w-full mb-2">
              <div className="w-0.5 h-6 bg-blue-400"></div>
              <div className="absolute top-6 h-0.5 w-2/3 bg-blue-400"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full place-items-center">
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

      {/* Form Modal */}
      {showFormModal && (
        <Modal
          isOpen={showFormModal}
          title={
            editingId
              ? "Edit Officer in Organization Chart"
              : "Add New Officer in Organization Chart"
          }
          onClose={closeFormModal}
        >
          <div className="p-6">
            <OrgForm
              formData={formData}
              onChange={handleChange}
              onFileChange={handleFileChange}
              onSubmit={handleSubmitForm}
              error={error}
              isLoading={crudLoading}
              isEditing={!!editingId}
              existingImage={formData.existingImage}
              backendUrl={backendUrl}
              onCancel={closeFormModal}
              imageFile={imageFile}
              isPresidentOccupied={isPresidentOccupied}
              isViceOccupied={isViceOccupied}
              positionIdBeingEdited={editingId}
            />
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <Modal
          isOpen={confirmModal.open}
          onClose={() =>
            setConfirmModal({ open: false, type: "", id: null, payload: null })
          }
          title={
            confirmModal.type === "delete"
              ? "Confirm Deletion"
              : "Confirm Update"
          }
        >
          <div className="p-6 space-y-4">
            <p className="text-gray-700">
              {confirmModal.type === "delete" ? (
                <>
                  Are you sure you want to delete{" "}
                  <strong className="text-red-600">
                    {selectedPosition ? selectedPosition.name : "this position"}
                  </strong>
                  ? This action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to update{" "}
                  <strong className="text-blue-600">
                    {confirmModal.payload?.name || "this position"}
                  </strong>
                  's information?
                </>
              )}
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() =>
                  setConfirmModal({
                    open: false,
                    type: "",
                    id: null,
                    payload: null,
                  })
                }
                disabled={crudLoading}
                icon={<XCircle className="h-4 w-4" />}
              >
                Cancel
              </Button>
              <Button
                variant={confirmModal.type === "delete" ? "danger" : "primary"}
                onClick={handleConfirmAction}
                icon={
                  crudLoading ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ) : confirmModal.type === "delete" ? (
                    <TrashIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <SaveIcon className="h-4 w-4 mr-2" />
                  )
                }
                disabled={crudLoading}
              >
                {crudLoading
                  ? "Processing..."
                  : confirmModal.type === "delete"
                  ? "Delete"
                  : "Confirm Update"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default OrgChart;
