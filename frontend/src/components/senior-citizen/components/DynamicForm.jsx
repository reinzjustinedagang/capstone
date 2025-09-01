import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../UI/Button";

const DynamicForm = ({ citizen, onSubmit }) => {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchFields = async () => {
      const res = await axios.get(`${backendUrl}/api/form-fields`);
      setFields(res.data);

      // Initialize form data
      const initialData = {};
      res.data.forEach((f) => {
        initialData[f.field_name] = citizen?.[f.field_name] || "";
      });
      setFormData(initialData);
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
    } else {
      setFormData({ ...formData, [field.field_name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => {
        const value = formData[field.field_name];
        switch (field.type) {
          case "text":
          case "number":
          case "date":
            return (
              <div key={field.id}>
                <label>{field.label}</label>
                <input
                  type={field.type}
                  value={value}
                  onChange={(e) => handleChange(e, field)}
                  required={field.required}
                />
              </div>
            );
          case "textarea":
            return (
              <div key={field.id}>
                <label>{field.label}</label>
                <textarea
                  value={value}
                  onChange={(e) => handleChange(e, field)}
                  required={field.required}
                />
              </div>
            );
          case "select":
            return (
              <div key={field.id}>
                <label>{field.label}</label>
                <select
                  value={value}
                  onChange={(e) => handleChange(e, field)}
                  required={field.required}
                >
                  <option value="">Select {field.label}</option>
                  {field.options.split(",").map((opt) => (
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
                <label>{field.label}</label>
                {field.options.split(",").map((opt) => (
                  <label key={opt}>
                    <input
                      type="radio"
                      value={opt}
                      checked={value === opt}
                      onChange={(e) => handleChange(e, field)}
                      required={field.required}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            );
          case "checkbox":
            return (
              <div key={field.id}>
                <label>{field.label}</label>
                {field.options.split(",").map((opt) => (
                  <label key={opt}>
                    <input
                      type="checkbox"
                      value={opt}
                      checked={(value || []).includes(opt)}
                      onChange={(e) => handleChange(e, field)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            );
          default:
            return null;
        }
      })}

      <Button type="submit">Submit</Button>
    </form>
  );
};

export default DynamicForm;
