import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";

const UpdateSeniorCitizenForm = ({ id, onSuccess }) => {
  const [fields, setFields] = useState([]);
  const [groups, setGroups] = useState([]);
  const [system, setSystem] = useState([]);
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [barangays, setBarangays] = useState([]);
  const [barangayLoading, setBarangayLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  // Fetch form schema, barangays, system, and current senior citizen data
  useEffect(() => {
    const fetchAllData = async () => {
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
        const fetchedFields = fieldsRes.data;
        const fetchedGroups = groupsRes.data;
        const fetchedSystem = systemRes.data;
        const barangaysData = barangayRes.data || [];
        const citizenData = citizenRes.data;

        setFields(fetchedFields);
        setGroups(fetchedGroups);
        setSystem(fetchedSystem);
        setBarangays(barangaysData);

        // Prepare initial form data:
        let initialData = {};
        const initialCollapsed = {};

        // System values
        const municipalityValue = fetchedSystem.municipality || "";
        const provinceValue = fetchedSystem.province || "";

        // Parse backend dynamic form data
        let dynamicFormData = {};
        if (citizenData.form_data) {
          try {
            dynamicFormData = JSON.parse(citizenData.form_data);
          } catch {}
        }

        fetchedFields.forEach((f) => {
          if (f.field_name.toLowerCase().includes("municipal")) {
            initialData[f.field_name] = municipalityValue;
          } else if (f.field_name.toLowerCase().includes("province")) {
            initialData[f.field_name] = provinceValue;
          } else if (f.field_name.toLowerCase().includes("barangay")) {
            initialData[f.field_name] = citizenData.barangay_id || "";
          } else if (
            ["firstName", "lastName", "middleName", "suffix"].includes(
              f.field_name
            )
          ) {
            initialData[f.field_name] = citizenData[f.field_name] || "";
          } else if (f.type === "checkbox") {
            // Checkbox: from dynamic or blank
            initialData[f.field_name] = dynamicFormData[f.field_name] || [];
          } else {
            initialData[f.field_name] = dynamicFormData[f.field_name] || "";
          }
          if (!(f.group in initialCollapsed)) {
            initialCollapsed[f.group] = false;
          }
        });

        setFormData(initialData);
        setOriginalData(initialData);
        setCollapsedGroups(initialCollapsed);
      } catch (err) {
        console.error("Error fetching senior citizen:", err);
        if (err.response) {
          console.error("Status:", err.response.status);
          console.error("Data:", err.response.data);
          if (err.response.status === 404) {
            setFormError("Senior citizen not found.");
            setFields([]);
            setGroups([]);
            setBarangays([]);
            setLoading(false);
            return;
          }
        }
        setFormError("Failed to load the form or senior citizen data.");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [backendUrl, id]);

  const handleChange = (e, field) => {
    const { type, value, checked } = e.target;
    if (field.type === "checkbox") {
      const prev = formData[field.field_name] || [];
      const newVal = checked
        ? [...prev, value]
        : prev.filter((v) => v !== value);
      setFormData({ ...formData, [field.field_name]: newVal });
    } else if (field.type === "date") {
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
      setFormData({ ...formData, [field.field_name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setFormError("");
    try {
      const { firstName, lastName, middleName, suffix, ...allFields } =
        formData;
      // find barangay field
      const barangayField = fields.find((f) =>
        f.field_name.toLowerCase().includes("barangay")
      );

      const barangay_id = Number(formData[barangayField.field_name]);

      // Remove barangay from dynamicFields
      const dynamicFields = { ...allFields };
      delete dynamicFields[barangayField.field_name];

      const payload = {
        firstName,
        lastName,
        middleName,
        suffix,
        barangay_id,
        form_data: JSON.stringify(dynamicFields),
      };

      await axios.put(
        `${backendUrl}/api/senior-citizens/update/${id}`,
        payload,
        {
          withCredentials: true,
        }
      );

      setShowConfirmModal(false);
      setShowSuccessModal(true);
      onSuccess?.();
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Failed to update senior citizen."
      );
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate("/admin/senior-citizen-list", {
      state: { message: "Senior citizen updated successfully!" },
    });
  };

  const toggleGroup = (groupName) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // barangay select rendering
  const renderBarangaySelect = (field) => {
    const value = formData[field.field_name];
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
              {b.barangay_name}
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

    // Province and Municipal fields are readonly, prefilled from system
    const isMunicipal = field.field_name.toLowerCase().includes("municipal");
    const isProvince = field.field_name.toLowerCase().includes("province");

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
              readOnly={isMunicipal || isProvince}
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
    <>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin rounded-full h-10 w-10 text-blue-600" />
          <span className="ml-3 text-gray-600 font-bold">Loading ...</span>
        </div>
      ) : fields.length === 0 ? (
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
      ) : (
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

          {formError && <p className="text-red-600">{formError}</p>}

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
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
            onClose={handleSuccessClose}
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
                    d="M9 12l2 2l4 -4"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Success
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Senior citizen updated successfully.
              </p>
              <Button variant="primary" onClick={handleSuccessClose}>
                OK
              </Button>
            </div>
          </Modal>
        </form>
      )}
    </>
  );
};

export default UpdateSeniorCitizenForm;
