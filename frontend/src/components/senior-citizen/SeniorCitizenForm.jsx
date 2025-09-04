import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";

const SeniorCitizenForm = ({ onSubmit, onCancel, onSuccess }) => {
  const [fields, setFields] = useState([]);
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [barangays, setBarangays] = useState([]);
  const [barangayLoading, setBarangayLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const backendUrl = "http://localhost:3000"; // replace with env
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        // Fetch fields and groups concurrently
        const [fieldsRes, groupsRes] = await Promise.all([
          axios.get(`${backendUrl}/api/form-fields/`, {
            withCredentials: true,
          }),
          axios.get(`${backendUrl}/api/form-fields/group`, {
            withCredentials: true,
          }),
        ]);

        const fetchedFields = fieldsRes.data;
        const fetchedGroups = groupsRes.data;

        setFields(fetchedFields);
        setGroups(fetchedGroups);

        // Fetch barangays separately
        try {
          setBarangayLoading(true);
          const barangayRes = await axios.get(
            `${backendUrl}/api/barangays/all`,
            { withCredentials: true }
          );
          setBarangays(barangayRes.data || []);
        } catch (err) {
          console.error("Failed to fetch barangays:", err);
          setBarangays([]);
          setFormError("Failed to load barangays. Please refresh the page.");
        } finally {
          setBarangayLoading(false);
        }

        // Prepare initial form data (empty but with all fields initialized)
        let initialData = {};
        const initialCollapsed = {};

        fetchedFields.forEach((f) => {
          initialData[f.field_name] = f.type === "checkbox" ? [] : "";
          if (!(f.group in initialCollapsed)) {
            initialCollapsed[f.group] = false; // expand by default
          }
        });

        setFormData(initialData);
        setCollapsedGroups(initialCollapsed);
      } catch (err) {
        console.error("Failed to fetch form fields/groups:", err);
        setFormError("Failed to load form. Please refresh the page.");
      }
    };

    fetchFormData();
  }, [backendUrl]);

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
    setShowConfirmModal(true); // open confirm first
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

      if (!barangayField) {
        setFormError("Barangay field is missing!");
        setIsSubmitting(false);
        return;
      }

      const barangay_id = Number(formData[barangayField.field_name]);

      // remove barangay from dynamicFields
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

      await axios.post(`${backendUrl}/api/senior-citizens/create`, payload, {
        withCredentials: true,
      });

      setShowConfirmModal(false);
      setShowSuccessModal(true);
      onSubmit?.();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || "Failed to submit form.");
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate("/admin/senior-citizen-list", {
      state: { message: "New senior citizen added!" },
    });
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

      {formError && <p className="text-red-600">{formError}</p>}

      <div className="flex justify-end gap-3">
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
