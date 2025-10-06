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

const SeniorCitizenForm = ({ onSubmit, onCancel, onSuccess }) => {
  const [fields, setFields] = useState([]);
  const [groups, setGroups] = useState([]);
  const [system, setSystem] = useState({});
  const [formData, setFormData] = useState({});
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [barangays, setBarangays] = useState([]);
  const [documentFile, setDocumentFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [barangayLoading, setBarangayLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [documentPreview, setDocumentPreview] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  /** ---------------------------
   * Fetch form data + barangays
   * --------------------------- */
  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);
      try {
        const [fieldsRes, groupsRes, systemRes] = await Promise.all([
          axios.get(`${backendUrl}/api/form-fields/`, {
            withCredentials: true,
          }),
          axios.get(`${backendUrl}/api/form-fields/group`, {
            withCredentials: true,
          }),
          axios.get(`${backendUrl}/api/settings/`, { withCredentials: true }),
        ]);

        const fetchedFields = fieldsRes.data || [];
        const fetchedGroups = groupsRes.data || [];
        const fetchedSystem = systemRes.data || {};

        setFields(fetchedFields);
        setGroups(fetchedGroups);
        setSystem(fetchedSystem);

        // Fetch barangays
        try {
          setBarangayLoading(true);
          const barangayRes = await axios.get(
            `${backendUrl}/api/barangays/all`,
            {
              withCredentials: true,
            }
          );
          setBarangays(barangayRes.data || []);
        } catch (err) {
          console.error("Failed to fetch barangays:", err);
          setFormError("Failed to load barangays. Please refresh the page.");
        } finally {
          setBarangayLoading(false);
        }

        // Initialize form data
        const initialData = {};
        const initialCollapsed = {};

        fetchedFields.forEach((f) => {
          if (f.field_name.toLowerCase().includes("municipal")) {
            initialData[f.field_name] = fetchedSystem.municipality || "";
          } else if (f.field_name.toLowerCase().includes("province")) {
            initialData[f.field_name] = fetchedSystem.province || "";
          } else {
            initialData[f.field_name] = f.type === "checkbox" ? [] : "";
          }
          if (!(f.group in initialCollapsed)) {
            initialCollapsed[f.group] = false;
          }
        });

        setFormData(initialData);
        setCollapsedGroups(initialCollapsed);
      } catch (err) {
        console.error("Failed to fetch form fields/groups:", err);
        setFormError("Failed to load form. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [backendUrl]);

  /** ---------------------------
   * Handle form value changes
   * --------------------------- */
  const handleChange = (e, field) => {
    const { type, value, checked } = e.target;

    if (field.type === "checkbox") {
      const prev = formData[field.field_name] || [];
      const newVal = checked
        ? [...prev, value]
        : prev.filter((v) => v !== value);
      setFormData({ ...formData, [field.field_name]: newVal });
      return;
    }

    if (field.type === "date") {
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

    setFormData({ ...formData, [field.field_name]: value });
  };

  /** ---------------------------
   * Handle file change
   * --------------------------- */
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      const file = files[0];
      if (name === "documentFile") {
        setDocumentFile(file);
        setDocumentPreview(URL.createObjectURL(file));
      } else if (name === "photoFile") {
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
      }
    }
  };

  /** ---------------------------
   * Handle submit
   * --------------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  /** ---------------------------
   * Final submit with files
   * --------------------------- */
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setFormError("");

    try {
      const { firstName, lastName, middleName, suffix, ...allFields } =
        formData;

      const barangayField = fields.find((f) =>
        f.field_name.toLowerCase().includes("barangay")
      );
      if (!barangayField) {
        setFormError("Barangay field is missing!");
        setIsSubmitting(false);
        return;
      }

      // if (!documentFile || !photoFile) {
      //   setFormError("Please upload both document and photo.");
      //   setIsSubmitting(false);
      //   return;
      // }

      const barangay_id = Number(formData[barangayField.field_name]);
      const dynamicFields = { ...allFields };
      delete dynamicFields[barangayField.field_name];

      // 🔹 Convert checkbox arrays to comma-separated strings
      for (const key in dynamicFields) {
        if (Array.isArray(dynamicFields[key])) {
          dynamicFields[key] = dynamicFields[key].join(", ");
        }
      }

      // 🔹 Use FormData for JSON + files
      const payload = new FormData();
      payload.append("firstName", firstName || "");
      payload.append("lastName", lastName || "");
      payload.append("middleName", middleName || "");
      payload.append("suffix", suffix || "");
      payload.append("barangay_id", barangay_id);
      payload.append("form_data", JSON.stringify(dynamicFields));
      payload.append("documentType", formData.documentType || "");

      // Append files if provided
      if (documentFile) payload.append("documentFile", documentFile);
      if (photoFile) payload.append("photoFile", photoFile);

      await axios.post(`${backendUrl}/api/senior-citizens/create`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowConfirmModal(false);
      onSubmit?.();
      onSuccess?.();
      navigate("/admin/senior-citizen-list", {
        state: { message: "New senior citizen added!" },
      });
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || "Failed to submit form.");
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  /** ---------------------------
   * Helpers
   * --------------------------- */
  const toggleGroup = (groupName) =>
    setCollapsedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));

  const renderBarangaySelect = (field) => (
    <div key={field.id}>
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-600"> *</span>}
      </label>
      <select
        value={formData[field.field_name] || ""}
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

  const renderField = (field) => {
    const value = formData[field.field_name];

    if (field.field_name.toLowerCase().includes("barangay")) {
      return renderBarangaySelect(field);
    }

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
              value={value || ""}
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
              value={value || ""}
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
              value={value || ""}
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

      <div className="bg-gray-50 rounded-md border border-gray-200">
        <div className="cursor-pointer flex justify-between items-center p-4 bg-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              Document & Photo Upload
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Upload one valid document and your 1x1 photo.
            </p>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type of Document <span className="text-red-600">*</span>
            </label>
            <select
              name="documentType"
              value={formData.documentType || ""}
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
              <label className="block text-sm font-medium text-gray-700">
                Upload Document <span className="text-red-600">*</span>
              </label>
              <div className="relative w-48 h-full border rounded-lg overflow-hidden bg-white flex flex-col items-center justify-center p-2">
                <img
                  src={documentPreview || "/placeholder-doc.png"}
                  alt="Document Preview"
                  className="object-contain h-40 w-full transition-transform duration-200 hover:scale-105 mb-2"
                  onClick={() => {
                    if (documentPreview) {
                      window.open(documentPreview, "_blank");
                    }
                  }}
                />
              </div>
              <input
                type="file"
                name="documentFile"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 
                     file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                     file:text-sm file:font-semibold file:bg-blue-50 file:text-gray-700 
                     hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload 1x1 Photo <span className="text-red-600">*</span>
            </label>
            <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-white flex flex-col items-center justify-center p-2">
              <img
                src={photoPreview || "/placeholder-photo.png"}
                alt="Photo Preview"
                className="object-cover h-full w-full transition-transform duration-200 hover:scale-110 mb-2"
                onClick={() => {
                  if (photoPreview) {
                    window.open(photoPreview, "_blank");
                  }
                }}
              />
            </div>
            <input
              type="file"
              name="photoFile"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 
                     file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                     file:text-sm file:font-semibold file:bg-blue-50 file:text-gray-700 
                     hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must have a white background.
            </p>
          </div>
        </div>
      </div>

      {formError && <p className="text-red-600">{formError}</p>}

      <div className="flex justify-end gap-3 mb-6 md:mb-0">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || barangayLoading}
        >
          {isSubmitting ? "Saving..." : "Register Senior Citizen"}
        </Button>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Add"
      >
        <div className="mt-4 text-sm text-gray-700">
          Are you sure you want to add this senior citizen?
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleFinalSubmit}
            className={`px-4 py-2 rounded text-sm ${
              isSubmitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {isSubmitting ? "Saving..." : "Yes, Add"}
          </button>
        </div>
      </Modal>
    </form>
  );
};

export default SeniorCitizenForm;
