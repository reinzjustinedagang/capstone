// UpdateSeniorCitizenForm.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Button from "../../UI/Button";
import Modal from "../../UI/Modal";

const documentTypes = [
  "Certificate of Live Birth",
  "Social Security System (SSS) ID",
  "Government Service Insurance System (GSIS) ID",
  "Driver's License",
  "Philippine Passport",
  "COMELEC ID / Voter's Certification",
  "Baptismal Certificate",
  "Marriage Certificate",
  "Unified Multi-Purpose ID (UMID)",
];

const UpdateSeniorCitizenForm = ({ id, onSuccess, onCancel }) => {
  const [fields, setFields] = useState([]);
  const [groups, setGroups] = useState([]);
  const [system, setSystem] = useState({});
  const [formData, setFormData] = useState({});
  const [documentPreview, setDocumentPreview] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [citizenData, setCitizenData] = useState({});

  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barangayLoading, setBarangayLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  /** ---------------------------
   * Fetch form + barangays + citizen data
   * --------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fieldsRes, groupsRes, systemRes, barangayRes, citizenRes] =
          await Promise.all([
            axios.get(`${backendUrl}/api/form-fields/`, {
              withCredentials: true,
            }),
            axios.get(`${backendUrl}/api/form-fields/group`, {
              withCredentials: true,
            }),
            axios.get(`${backendUrl}/api/settings/`, { withCredentials: true }),
            axios.get(`${backendUrl}/api/barangays/all`, {
              withCredentials: true,
            }),
            axios.get(`${backendUrl}/api/senior-citizens/get/${id}`, {
              withCredentials: true,
            }),
          ]);

        const fetchedFields = fieldsRes.data || [];
        const fetchedGroups = groupsRes.data || [];
        const fetchedSystem = systemRes.data || {};
        const fetchedBarangays = barangayRes.data || [];
        const citizenData = citizenRes.data || {};
        setCitizenData(citizenData);
        setFields(fetchedFields);
        setGroups(fetchedGroups);
        setSystem(fetchedSystem);
        setBarangays(fetchedBarangays);

        // Initialize formData
        const dynamicFormData = citizenData.form_data
          ? typeof citizenData.form_data === "string"
            ? JSON.parse(citizenData.form_data)
            : citizenData.form_data
          : {};

        // ✅ Fix checkbox values (convert strings to arrays)
        for (const key in dynamicFormData) {
          const fieldDef = fetchedFields.find((f) => f.field_name === key);
          if (
            fieldDef &&
            fieldDef.type === "checkbox" &&
            typeof dynamicFormData[key] === "string"
          ) {
            dynamicFormData[key] = dynamicFormData[key]
              .split(",")
              .map((opt) => opt.trim())
              .filter(Boolean);
          }
        }

        const initialData = {};
        const initialCollapsed = {};

        fetchedFields.forEach((f) => {
          if (f.field_name.toLowerCase().includes("municipal")) {
            initialData[f.field_name] = fetchedSystem.municipality || "";
          } else if (f.field_name.toLowerCase().includes("province")) {
            initialData[f.field_name] = fetchedSystem.province || "";
          } else if (f.field_name.toLowerCase().includes("barangay")) {
            const barId =
              dynamicFormData[f.field_name] ||
              dynamicFormData["barangay_id"] ||
              citizenData.barangay_id;
            initialData[f.field_name] = barId ? String(barId) : "";
          } else if (
            ["firstName", "middleName", "lastName", "suffix"].includes(
              f.field_name
            )
          ) {
            initialData[f.field_name] = citizenData[f.field_name] || "";
          } else {
            initialData[f.field_name] =
              dynamicFormData[f.field_name] ||
              (f.type === "checkbox" ? [] : "");
          }

          if (!(f.group in initialCollapsed)) initialCollapsed[f.group] = false;
        });

        // ✅ Merge everything once
        setFormData({
          ...initialData,
          documentType: citizenData.document_type || "",
        });
        setDocumentPreview(citizenData.document_image || null);
        setPhotoPreview(citizenData.photo || null);
        setCollapsedGroups(initialCollapsed);
      } catch (err) {
        console.error(err);
        setFormError("Failed to load senior citizen or form data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [backendUrl, id]);

  /** ---------------------------
   * Handle changes
   * --------------------------- */
  const handleChange = (e, field) => {
    const { type, value, checked, files, name } = e.target;

    // Handle file inputs
    if (name === "documentFile" && files[0]) {
      setDocumentFile(files[0]);
      setDocumentPreview(URL.createObjectURL(files[0]));
      return;
    }
    if (name === "photoFile" && files[0]) {
      setPhotoFile(files[0]);
      setPhotoPreview(URL.createObjectURL(files[0]));
      return;
    }

    // Handle normal inputs
    if (field?.type === "checkbox") {
      const prev = formData[field.field_name] || [];
      const newVal = checked
        ? [...prev, value]
        : prev.filter((v) => v !== value);
      setFormData({ ...formData, [field.field_name]: newVal });
      return;
    }

    if (field?.type === "date") {
      setFormData((prev) => ({ ...prev, [field.field_name]: value }));
      if (field.field_name === "birthdate") {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        setFormData((prev) => ({ ...prev, age: age >= 0 ? age : "" }));
      }
      return;
    }

    if (field) {
      setFormData({ ...formData, [field.field_name]: value });
    }
  };

  /** ---------------------------
   * Handle submit
   * --------------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setFormError("");

    try {
      const { firstName, middleName, lastName, suffix, ...allFields } =
        formData;

      const barangayField = fields.find((f) =>
        f.field_name.toLowerCase().includes("barangay")
      );
      if (!barangayField) throw new Error("Barangay field is missing!");

      const barangay_id = Number(formData[barangayField.field_name]);
      const dynamicFields = { ...allFields };
      // ✅ also keep barangay_id inside form_data
      dynamicFields["barangay_id"] = barangay_id;

      for (const key in dynamicFields) {
        if (Array.isArray(dynamicFields[key])) {
          dynamicFields[key] = dynamicFields[key].join(", ");
        }
      }

      // Use FormData for mixed text + files
      const formDataToSend = new FormData();
      formDataToSend.append("firstName", firstName || "");
      formDataToSend.append("middleName", middleName || "");
      formDataToSend.append("lastName", lastName || "");
      formDataToSend.append("suffix", suffix || "");
      formDataToSend.append("barangay_id", barangay_id);
      formDataToSend.append("form_data", JSON.stringify(dynamicFields));
      formDataToSend.append("documentType", formData.documentType || "");

      if (documentFile) formDataToSend.append("documentFile", documentFile);
      if (photoFile) formDataToSend.append("photoFile", photoFile);

      await axios.put(
        `${backendUrl}/api/senior-citizens/update/${id}`,
        formDataToSend,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setShowSuccessModal(true);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setFormError(
        err.response?.data?.message || "Failed to update senior citizen."
      );
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  /** ---------------------------
   * Helpers
   * --------------------------- */
  const toggleGroup = (groupName) =>
    setCollapsedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));

  const renderBarangaySelect = (field) => {
    const value = formData[field.field_name] || "";
    return (
      <div key={field.id}>
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-600"> *</span>}
        </label>
        <select
          value={value}
          onChange={(e) => handleChange(e, field)}
          required={field.required}
          disabled={barangayLoading}
          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">
            {barangayLoading ? "Loading barangays..." : `Select ${field.label}`}
          </option>
          {barangays.map((b) => (
            <option key={b.id} value={b.id}>
              {b.barangay_name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderField = (field) => {
    if (field.field_name.toLowerCase().includes("barangay"))
      return renderBarangaySelect(field);

    const value = formData[field.field_name] || "";
    const commonLabel = (
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required ? <span className="text-red-600"> *</span> : <></>}
      </label>
    );

    switch (field.type) {
      case "text":
      case "number":
      case "date":
        return (
          <div key={field.id}>
            {commonLabel}
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleChange(e, field)}
              required={field.required}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        );
      case "textarea":
        return (
          <div key={field.id}>
            {commonLabel}
            <textarea
              value={value}
              onChange={(e) => handleChange(e, field)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        );
      case "select":
        return (
          <div key={field.id}>
            {commonLabel}
            <select
              value={value}
              onChange={(e) => handleChange(e, field)}
              required={field.required}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select {field.label}</option>
              {field.options?.split(",").map((opt) => (
                <option key={opt.trim()} value={opt.trim()}>
                  {opt.trim()}
                </option>
              ))}
            </select>
          </div>
        );
      case "radio":
        return (
          <div key={field.id}>
            {commonLabel}
            <div className="space-y-2">
              {field.options?.split(",").map((opt) => (
                <label key={opt.trim()} className="flex items-center text-sm">
                  <input
                    type="radio"
                    value={opt.trim()}
                    checked={value === opt.trim()}
                    onChange={(e) => handleChange(e, field)}
                    required={field.required}
                    className="mr-2"
                  />
                  {opt.trim()}
                </label>
              ))}
            </div>
          </div>
        );
      case "checkbox":
        return (
          <div key={field.id}>
            {commonLabel}
            <div className="space-y-2">
              {field.options?.split(",").map((opt) => (
                <label key={opt.trim()} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    value={opt.trim()}
                    checked={(value || []).includes(opt.trim())}
                    onChange={(e) => handleChange(e, field)}
                    className="mr-2"
                  />
                  {opt.trim()}
                </label>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const groupedFields = fields.reduce((acc, field) => {
    if (!acc[field.group]) acc[field.group] = [];
    acc[field.group].push(field);
    return acc;
  }, {});

  /** ---------------------------
   * Render
   * --------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
        <span className="ml-3 text-gray-600 font-bold">Loading ...</span>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md bg-gray-50">
        <p className="text-gray-600 mb-4">
          No fields available. Please add fields first.
        </p>
        <Button
          onClick={() => navigate("/admin/settings#senior-form")}
          variant="primary"
        >
          Add New Field
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-6 md:p-4" onSubmit={handleSubmit}>
      {groups
        .filter((g) => groupedFields[g.group_key])
        .map((g) => (
          <div
            key={g.group_key}
            className="bg-gray-50 rounded-md border border-gray-200"
          >
            <div
              onClick={() => toggleGroup(g.group_key)}
              className="cursor-pointer flex justify-between items-center p-4 bg-gray-100"
            >
              <h3 className="text-base font-semibold text-gray-800">
                {g.group_label}
              </h3>
              <span className="text-gray-600">
                {collapsedGroups[g.group_key] ? <ChevronUp /> : <ChevronDown />}
              </span>
            </div>
            {!collapsedGroups[g.group_key] && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {groupedFields[g.group_key]
                  .sort((a, b) => a.order - b.order)
                  .map((field) => renderField(field))}
              </div>
            )}
          </div>
        ))}

      {/* Document & Photo Upload */}
      <div className="bg-gray-50 rounded-md border border-gray-200">
        <div className="cursor-pointer flex justify-between items-center p-4 bg-gray-100">
          <h3 className="text-base font-semibold text-gray-800">
            Document & Photo Upload
          </h3>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type of Document <span className="text-red-600">*</span>
            </label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={(e) =>
                setFormData({ ...formData, documentType: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 
                   focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">-- Select a document --</option>
              {documentTypes.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>

            {/* Document Upload */}
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Document
              </label>
              <div className="relative w-48 h-full border rounded-lg overflow-hidden bg-white flex flex-col items-center justify-center p-2">
                {documentPreview || citizenData?.document_image ? (
                  <img
                    src={documentPreview || citizenData?.document_image}
                    alt="Document"
                    className="object-contain h-40 w-full transition-transform duration-200 hover:scale-105 mb-2"
                    onClick={() =>
                      window.open(
                        documentPreview || citizenData?.document_image,
                        "_blank"
                      )
                    }
                  />
                ) : (
                  <span className="text-gray-400 text-sm mb-2">
                    No document uploaded
                  </span>
                )}

                {/* Always show input */}
              </div>{" "}
              <input
                type="file"
                name="documentFile"
                accept="image/*,application/pdf"
                onChange={handleChange}
                className="mt-1 block w-full text-sm text-gray-500 
                     file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                     file:text-sm file:font-semibold file:bg-blue-50 file:text-gray-700 
                     hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1x1 Photo
            </label>
            <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-white flex flex-col items-center justify-center p-2">
              {photoPreview || citizenData?.photo ? (
                <img
                  src={photoPreview || citizenData?.photo}
                  alt="Photo"
                  className="object-cover h-full w-full transition-transform duration-200 hover:scale-110 mb-2"
                  onClick={() =>
                    window.open(photoPreview || citizenData?.photo, "_blank")
                  }
                />
              ) : (
                <span className="text-gray-400 text-sm mb-2">
                  No photo uploaded
                </span>
              )}
            </div>
            {/* Always show input */}
            <input
              type="file"
              name="photoFile"
              accept="image/*"
              onChange={handleChange}
              className="mt-1 block w-full text-sm text-gray-500 
                     file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                     file:text-sm file:font-semibold file:bg-blue-50 file:text-gray-700 
                     hover:file:bg-blue-100"
            />
          </div>
        </div>
      </div>

      {formError && <p className="text-red-600">{formError}</p>}

      <div className="flex justify-end mb-6 md:mb-0 gap-3 ">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || barangayLoading}
        >
          {isSubmitting ? "Saving..." : "Update Senior Citizen"}
        </Button>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Update"
      >
        <div className="mt-4 text-sm text-gray-700">
          Are you sure you want to update this senior citizen?
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            disabled={isSubmitting}
            onClick={handleFinalSubmit}
            className={`px-4 py-2 rounded text-sm ${
              isSubmitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {isSubmitting ? "Saving..." : "Yes, Update"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => navigate("/admin/senior-citizen-list")}
        title="Success"
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2l4-4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Success</h3>
          <p className="text-sm text-gray-600 mb-4">
            Senior citizen updated successfully.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate("/admin/senior-citizen-list")}
          >
            OK
          </Button>
        </div>
      </Modal>
    </form>
  );
};

export default UpdateSeniorCitizenForm;
