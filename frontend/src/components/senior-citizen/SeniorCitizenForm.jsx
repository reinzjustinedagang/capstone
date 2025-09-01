import React, { useEffect, useState } from "react";
import Button from "../UI/Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

const SeniorCitizenForm = ({ citizen, onSubmit, onCancel }) => {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  // Fetch form fields
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/form-fields/`);
        setFields(res.data);

        const initialData = {};
        const initialCollapsed = {};
        res.data.forEach((f) => {
          initialData[f.field_name] =
            citizen?.[f.field_name] || (f.type === "checkbox" ? [] : "");
          if (!(f.group in initialCollapsed)) initialCollapsed[f.group] = false; // default expanded
        });
        setFormData(initialData);
        setCollapsedGroups(initialCollapsed);
      } catch (err) {
        console.error("Failed to fetch form fields:", err);
      }
    };
    fetchFields();
  }, [citizen]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const payload = {
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        // Add other fixed fields if any
        form_data: JSON.stringify(formData), // <-- all dynamic fields here
      };

      const url = citizen
        ? `${backendUrl}/api/senior-citizens/update/${citizen.id}`
        : `${backendUrl}/api/senior-citizens/create`;
      const method = citizen ? "put" : "post";

      await axios[method](url, payload, { withCredentials: true });
      onSubmit?.();
    } catch (err) {
      console.error(err);
      setFormError("Failed to submit form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGroup = (groupName) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const groupedFields = fields.reduce((acc, field) => {
    if (!acc[field.group]) acc[field.group] = [];
    acc[field.group].push(field);
    return acc;
  }, {});

  // Define group order and symbols
  const groupOrder = [
    "i_personal_information",
    "ii_contact_information",
    "iii_address",
    "iv_other",
  ];

  const groupSymbols = {
    i_personal_information: "I. Personal Information",
    ii_contact_information: "II. Contact Information",
    iii_address: "III. Address",
    iv_other: "IV. Other",
  };

  // Render when no fields exist
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
      {groupOrder
        .filter((groupName) => groupedFields[groupName]) // only existing groups
        .map((groupName) => (
          <div
            key={groupName}
            className="bg-gray-50 rounded-md border border-gray-200"
          >
            <div
              onClick={() => toggleGroup(groupName)}
              className="cursor-pointer flex justify-between items-center p-4 bg-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {groupSymbols[groupName] || groupName.replace("_", " ")}
              </h3>
              <span className="text-gray-600">
                {collapsedGroups[groupName] ? <ChevronUp /> : <ChevronDown />}
              </span>
            </div>

            {!collapsedGroups[groupName] && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {groupedFields[groupName]
                  .sort((a, b) => a.order - b.order)
                  .map((field) => {
                    const value = formData[field.field_name];
                    switch (field.type) {
                      case "text":
                      case "number":
                      case "date":
                        return (
                          <div key={field.id}>
                            <label className="block">
                              {field.label}
                              {field.required ? (
                                <span className="text-red-600"> *</span>
                              ) : null}
                            </label>
                            <input
                              type={field.type}
                              value={value}
                              onChange={(e) => handleChange(e, field)}
                              required={field.required}
                              className="border p-2 rounded w-full"
                            />
                          </div>
                        );
                      case "textarea":
                        return (
                          <div key={field.id}>
                            <label className="block">{field.label}</label>
                            <textarea
                              value={value}
                              onChange={(e) => handleChange(e, field)}
                              className="border p-2 rounded w-full"
                            />
                          </div>
                        );
                      case "select":
                        return (
                          <div key={field.id}>
                            <label className="block">
                              {field.label}
                              {field.required ? (
                                <span className="text-red-600"> *</span>
                              ) : null}
                            </label>
                            <select
                              value={value}
                              onChange={(e) => handleChange(e, field)}
                              required={field.required}
                              className="border p-2 rounded w-full"
                            >
                              <option value="">Select {field.label}</option>
                              {field.options?.split(",").map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      case "radio":
                        return (
                          <div key={field.id}>
                            <label className="block">
                              {field.label}
                              {field.required ? (
                                <span className="text-red-600"> *</span>
                              ) : null}
                            </label>
                            {field.options?.split(",").map((opt) => (
                              <label key={opt} className="mr-4">
                                <input
                                  type="radio"
                                  value={opt}
                                  checked={value === opt}
                                  onChange={(e) => handleChange(e, field)}
                                  required={field.required}
                                />{" "}
                                {opt}
                              </label>
                            ))}
                          </div>
                        );
                      case "checkbox":
                        return (
                          <div key={field.id}>
                            <label className="block">{field.label}</label>
                            {field.options?.split(",").map((opt) => (
                              <label key={opt} className="mr-4">
                                <input
                                  type="checkbox"
                                  value={opt}
                                  checked={(value || []).includes(opt)}
                                  onChange={(e) => handleChange(e, field)}
                                />{" "}
                                {opt}
                              </label>
                            ))}
                          </div>
                        );
                      default:
                        return null;
                    }
                  })}
              </div>
            )}
          </div>
        ))}

      {formError && <p className="text-red-600">{formError}</p>}

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : citizen ? "Update" : "Register"} Senior
          Citizen
        </Button>
      </div>
    </form>
  );
};

export default SeniorCitizenForm;
