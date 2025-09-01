import React, { useState } from "react";

const PreviewField = ({ field }) => {
  const [value, setValue] = useState("");

  if (!field.field_name) return null; // only show preview if user typed a name

  const handleChange = (e) => setValue(e.target.value);

  const renderOptions = () => {
    return field.options?.split(",").map((opt) => opt.trim());
  };

  switch (field.type) {
    case "text":
    case "number":
    case "date":
      return (
        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-700">
            {field.label} {field.required ? "*" : ""}
          </label>
          <input
            type={field.type}
            placeholder={field.label}
            value={value}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      );
    case "textarea":
      return (
        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-700">
            {field.label} {field.required ? "*" : ""}
          </label>
          <textarea
            placeholder={field.label}
            value={value}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>
      );
    case "select":
      return (
        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-700">
            {field.label} {field.required ? "*" : ""}
          </label>
          <select
            value={value}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select {field.label}</option>
            {renderOptions()?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    case "radio":
      return (
        <div className="mb-4">
          <label className="block font-medium mb-2 text-gray-700">
            {field.label} {field.required ? "*" : ""}
          </label>
          <div className="flex flex-wrap gap-4">
            {renderOptions()?.map((opt) => (
              <label key={opt} className="flex items-center gap-1">
                <input
                  type="radio"
                  name={field.field_name}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => setValue(e.target.value)}
                  className="accent-blue-600"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );
    case "checkbox":
      return (
        <div className="mb-4">
          <label className="block font-medium mb-2 text-gray-700">
            {field.label} {field.required ? "*" : ""}
          </label>
          <div className="flex flex-wrap gap-4">
            {renderOptions()?.map((opt) => (
              <label key={opt} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  value={opt}
                  checked={value.includes(opt)}
                  onChange={(e) => {
                    if (value.includes(opt)) {
                      setValue(value.filter((v) => v !== opt));
                    } else {
                      setValue([...value, opt]);
                    }
                  }}
                  className="accent-blue-600"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default PreviewField;
