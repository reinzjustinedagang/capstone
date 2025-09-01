import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  List,
  Type,
  Layers,
  ToggleLeft,
  Settings2,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  PlusCircle,
} from "lucide-react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import PreviewField from "./component/PreviewField";

const FormFieldsPage = () => {
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({
    field_name: "",
    label: "",
    type: "text",
    options: "",
    required: 0,
    group: "i_personal_information",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchFields = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/form-fields`, {
        withCredentials: true,
      });
      setFields(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch fields.");
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewField((prev) => {
      let updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Clear options if type changes to one that doesn't need options
      if (name === "type" && !["select", "radio", "checkbox"].includes(value)) {
        updated.options = "";
      }

      return updated;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    // Convert checkbox to 1/0
    const preparedField = {
      ...newField,
      required: newField.required ? 1 : 0,
    };

    // Check for duplicate field_name or label
    if (
      fields.some(
        (f) =>
          f.field_name === preparedField.field_name ||
          f.label === preparedField.label
      )
    ) {
      setError("A field with the same name or label already exists.");
      setLoading(false);
      return;
    }

    try {
      // Auto-assign order
      const nextOrder =
        fields.length > 0
          ? Math.max(...fields.map((f) => f.order || 0)) + 1
          : 1;

      const fieldToSave = { ...preparedField, order: nextOrder };

      const res = await axios.post(
        `${backendUrl}/api/form-fields`,
        fieldToSave,
        {
          withCredentials: true,
        }
      );

      setSuccessMessage(res.data?.message || "Field added successfully!");
      setShowSuccessModal(true);

      // Reset form
      setNewField({
        field_name: "",
        label: "",
        type: "text",
        options: "",
        required: 0,
        group: "i_personal_information",
      });

      fetchFields();
    } catch (err) {
      console.error(err);
      // Show backend error message if available
      setError(err.response?.data?.message || "Failed to add field.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this field?")) return;
    try {
      await axios.delete(`${backendUrl}/api/form-fields/${id}`, {
        withCredentials: true,
      });
      fetchFields();
    } catch (err) {
      console.error(err);
      setError("Failed to delete field.");
    }
  };

  // Group fields by `group`
  const groupedFields = fields.reduce((acc, field) => {
    const groupName = field.group || "Ungrouped";
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(field);
    return acc;
  }, {});

  const groupSymbols = {
    i_personal_information: "I. Personal Information",
    ii_contact_information: "II. Contact Information",
    iii_address: "III. Address",
    iv_other: "IV. Other",
  };

  // Optional: define default order for display
  const groupOrder = [
    "i_personal_information",
    "ii_contact_information",
    "iii_address",
    "iv_other",
  ];

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirmModal(true);
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Required */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="required"
              checked={newField.required == 1}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Required
            </label>
          </div>

          {/* Field Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Field Name *
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                name="field_name"
                value={newField.field_name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <List className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Label *
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                name="label"
                value={newField.label}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <Type className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type *
            </label>
            <div className="mt-1 relative">
              <select
                name="type"
                value={newField.type}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="textarea">Textarea</option>
                <option value="select">Select</option>
                <option value="radio">Radio</option>
                <option value="checkbox">Checkbox</option>
              </select>
              <Settings2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Group
            </label>
            <div className="mt-1 relative">
              <select
                name="group"
                value={newField.group}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none"
              >
                {Object.keys(groupSymbols).map((key) => (
                  <option key={key} value={key}>
                    {groupSymbols[key]}
                  </option>
                ))}
              </select>
              <ToggleLeft className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Options - only visible for select, radio, checkbox */}
          {["select", "radio", "checkbox"].includes(newField.type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Options (comma separated)
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="options"
                  value={newField.options}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <Layers className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          )}
        </div>
        {/* Preview */}
        <div className="grid md:grid-cols-2">
          <div className="mt-6 p-4 border border-gray-300 rounded bg-gray-50">
            <h4 className="font-semibold mb-2 text-gray-700">Preview</h4>
            <PreviewField field={newField} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-600 flex items-center gap-2 mt-2">
            <XCircle size={18} /> {error}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end items-center mt-6">
          <Button
            type="submit"
            disabled={loading}
            icon={
              loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <PlusCircle />
              )
            }
          >
            {loading ? "Saving..." : "Add Field"}
          </Button>
        </div>
      </form>

      {/* Existing Fields Grouped */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Existing Fields</h3>
        {groupOrder
          .filter((groupName) => groupedFields[groupName]) // only existing groups
          .map((groupName) => (
            <div key={groupName} className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">
                {groupSymbols[groupName]}
              </h4>
              <ul className="space-y-4 space-x-4 md:grid grid-cols-3">
                {groupedFields[groupName].map((f) => (
                  <li
                    key={f.id}
                    className="flex justify-between items-center border p-2 rounded"
                  >
                    <span className="text-sm font-medium text-gray-800">
                      {f.label} ({f.type})
                    </span>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(f.id)}
                      icon={<Trash2 size={16} />}
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Add Field"
      >
        <div className="mt-4 text-sm text-gray-700">
          Are you sure you want to add this new field?
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={() => {
              setShowConfirmModal(false);
              handleSubmit();
            }}
            className={`px-4 py-2 rounded text-sm ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {loading ? "Saving..." : "Yes, Add"}
          </button>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
      >
        <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
          <CheckCircle size={20} /> {successMessage}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowSuccessModal(false)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            OK
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FormFieldsPage;
