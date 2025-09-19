import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, CheckCircle, Loader2 } from "lucide-react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";

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

const RegisterSenior = () => {
  const [fields, setFields] = useState([]);
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [barangays, setBarangays] = useState([]);
  const [system, setSystem] = useState({});
  const [barangayLoading, setBarangayLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(
    "Senior citizen has been registered successfully!"
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);

      try {
        const [fieldsRes, groupsRes, systemRes] = await Promise.all([
          axios.get(`${backendUrl}/api/form-fields/register-field`, {
            withCredentials: true,
          }),
          axios.get(`${backendUrl}/api/form-fields/group`, {
            withCredentials: true,
          }),
          axios.get(`${backendUrl}/api/settings/`, { withCredentials: true }),
        ]);

        const fetchedFields = fieldsRes.data;
        const fetchedGroups = groupsRes.data;
        const fetchedSystem = systemRes.data || {};

        setFields(fetchedFields);
        setGroups(fetchedGroups);
        setSystem(fetchedSystem);

        // fetch barangays
        try {
          setBarangayLoading(true);
          const barangayRes = await axios.get(
            `${backendUrl}/api/barangays/all`,
            { withCredentials: true }
          );
          setBarangays(barangayRes.data || []);
          setFormError("");
        } catch (err) {
          console.error("Failed to fetch barangays:", err);
          setBarangays([]);
          setFormError("Failed to load barangays. Please refresh the page.");
        } finally {
          setBarangayLoading(false);
        }

        // initialize form data
        let initialData = {};
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

  const handleChange = (e, field) => {
    const { type, value, checked, name, files } = e.target;

    // handle file inputs
    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0], // store the actual File object
      }));
      return;
    }

    if (field?.type === "checkbox") {
      const prev = formData[field.field_name] || [];
      const newVal = checked
        ? [...prev, value]
        : prev.filter((v) => v !== value);
      setFormData({ ...formData, [field.field_name]: newVal });
    } else if (field?.type === "date") {
      setFormData((prev) => ({ ...prev, [field.field_name]: value }));
      if (field.field_name === "birthdate") {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        setFormData((prev) => ({ ...prev, age: age >= 0 ? age : "" }));
      }
    } else {
      setFormData({ ...formData, [field?.field_name || name]: value });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));

      // for preview
      const previewUrl = URL.createObjectURL(files[0]);
      if (name === "documentFile") setDocumentPreview(previewUrl);
      if (name === "photoFile") setPhotoPreview(previewUrl);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true); // open confirm first
  };

  // helper to reset the form back to initial state
  const resetForm = () => {
    const resetData = {};
    fields.forEach((field) => {
      resetData[field.field_name] = field.type === "checkbox" ? [] : "";
    });

    fields.forEach((field) => {
      if (field.field_name.toLowerCase().includes("municipal")) {
        resetData[field.field_name] = system.municipality || "";
      }
      if (field.field_name.toLowerCase().includes("province")) {
        resetData[field.field_name] = system.province || "";
      }
    });

    setFormData(resetData);
    setFormError("");
    setDocumentPreview(null);
    setPhotoPreview(null);

    document.querySelectorAll("input[type='file']").forEach((input) => {
      input.value = "";
    });
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setFormError("");

    try {
      const {
        firstName,
        lastName,
        middleName,
        suffix,
        documentType,
        documentFile,
        photoFile,
        ...dynamicFields
      } = formData;

      // find barangay field
      const barangayField = fields.find((f) =>
        f.field_name.toLowerCase().includes("barangay")
      );
      if (!barangayField) {
        setFormError("Barangay field is missing!");
        setIsSubmitting(false);
        return;
      }

      const barangay_id = Number(formData[barangayField.field_name]);
      delete dynamicFields[barangayField.field_name]; // avoid duplication

      // ensure system values are filled
      fields.forEach((f) => {
        if (
          f.field_name.toLowerCase().includes("municipal") &&
          !dynamicFields[f.field_name]
        ) {
          dynamicFields[f.field_name] = system.municipality || "";
        }
        if (
          f.field_name.toLowerCase().includes("province") &&
          !dynamicFields[f.field_name]
        ) {
          dynamicFields[f.field_name] = system.province || "";
        }
      });

      // build FormData payload
      const fd = new FormData();
      fd.append("firstName", firstName || "");
      fd.append("lastName", lastName || "");
      fd.append("middleName", middleName || "");
      fd.append("suffix", suffix || "");
      fd.append("barangay_id", barangay_id || "");
      fd.append("form_data", JSON.stringify(dynamicFields));

      // ✅ document upload is hardcoded, not from DB fields
      fd.append("documentType", documentType || "");
      if (documentFile) fd.append("documentFile", documentFile);
      if (photoFile) fd.append("photoFile", photoFile);

      await axios.post(`${backendUrl}/api/senior-citizens/apply`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowConfirmModal(false);
      setShowSuccessModal(true);

      // ✅ clear everything after success
      resetForm();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || "Failed to submit form.");
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGroup = (groupName) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // barangay special rendering kept
  const renderBarangaySelect = (field) => {
    const value = formData[field.field_name]; // will store id now
    return (
      <div key={field.id}>
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required ? <span className="text-red-600"> *</span> : null}
        </label>
        <select
          value={value || ""}
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
              {b.barangay_name} {/* display name */}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderField = (field) => {
    const value = formData[field.field_name];

    if (
      field.field_name.toLowerCase().includes("barangay") ||
      field.label.toLowerCase().includes("barangay")
    ) {
      return renderBarangaySelect(field);
    }

    switch (field.type) {
      case "text":
      case "number":
      case "date":
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required ? <span className="text-red-600"> *</span> : null}
            </label>
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
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
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
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required ? <span className="text-red-600"> *</span> : null}
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required ? <span className="text-red-600"> *</span> : null}
            </label>
            <div className="space-y-2">
              {field.options?.split(",").map((opt) => (
                <label
                  key={opt.trim()}
                  className="flex items-center text-sm text-gray-700"
                >
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>
            <div className="space-y-2">
              {field.options?.split(",").map((opt) => (
                <label
                  key={opt.trim()}
                  className="flex items-center text-sm text-gray-700"
                >
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

  return (
    <div className="max-w-7xl mx-auto my-6">
      {/* Section Header */}
      <div className="text-center px-5 py-6 md:px-25 bg-white">
        <h2 className="text-3xl font-bold text-gray-900">
          Senior Citizen Registration Form
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin rounded-full h-10 w-10 text-blue-600" />
          <span className="ml-3 text-gray-600 font-bold">Loading ...</span>
        </div>
      ) : fields.length === 0 ? (
        <div className="text-center p-8 border rounded-md bg-gray-50">
          <p className="text-gray-600 mb-4">
            No fields available at the Moment.
          </p>
        </div>
      ) : (
        <form className="space-y-6 md:p-5" onSubmit={handleSubmit}>
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
                    {collapsedGroups[g.group_key] ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
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
                {/* Document Section */}
                <div>
                  {/* Document Type */}
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

            {/* Agreement */}
          </div>
          <div className="mx-4 md:mx-0 relative flex gap-x-3 ">
            <div className="flex h-6 items-center">
              <input
                id="agreement"
                name="agreement"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
            </div>
            <div className="text-sm leading-6">
              <label htmlFor="agreement" className="font-medium text-gray-900">
                I hereby certify that the information provided is true and
                correct to the best of my knowledge.
              </label>
            </div>
          </div>

          {formError && <p className="text-red-600">{formError}</p>}

          <div className="mx-4 md:mx-0 flex justify-end gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || barangayLoading}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
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

          <Modal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            title=""
          >
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Success
              </h3>
              <p className="text-sm text-gray-600 mb-4">{successMessage}</p>
              <Button
                variant="primary"
                onClick={() => setShowSuccessModal(false)}
              >
                OK
              </Button>
            </div>
          </Modal>
        </form>
      )}
    </div>
  );
};

export default RegisterSenior;
