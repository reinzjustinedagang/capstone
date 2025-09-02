import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  List,
  Type,
  Layers,
  Boxes,
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
    group: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [groups, setGroups] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupKey, setNewGroupKey] = useState("");
  const [newGroupLabel, setNewGroupLabel] = useState("");

  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/form-fields/group`, {
        withCredentials: true,
      });
      setGroups(res.data); // Expecting [{ id, group_key, group_label }]
    } catch (err) {
      console.error(err);
      setError("Failed to fetch groups.");
    }
  };

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
    fetchGroups();
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
        group: "",
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

  const handleAddGroup = async () => {
    if (!newGroupKey || !newGroupLabel) return;

    try {
      await axios.post(
        `${backendUrl}/api/form-fields/group`,
        { group_key: newGroupKey, group_label: newGroupLabel },
        { withCredentials: true }
      );

      await fetchGroups(); // refresh list
      setNewGroupKey("");
      setNewGroupLabel("");
      setShowGroupModal(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create group.");
    }
  };

  const handleMoveField = async (id, direction) => {
    const field = fields.find((f) => f.id === id);
    if (!field) return;

    // Only fields in the same group
    const groupFields = fields
      .filter((f) => f.group === field.group)
      .sort((a, b) => a.order - b.order);

    console.log(
      "Group fields before move:",
      groupFields.map((f) => ({ id: f.id, label: f.label, order: f.order }))
    );

    const index = groupFields.findIndex((f) => f.id === id);
    const newIndex = index + direction;

    console.log(
      `Moving field ${field.label} from index ${index} to ${newIndex}`
    );

    // Check bounds
    if (newIndex < 0 || newIndex >= groupFields.length) {
      console.log("Move cancelled - out of bounds");
      return;
    }

    // Swap the fields at current index and new index
    const fieldAtCurrentIndex = groupFields[index];
    const fieldAtNewIndex = groupFields[newIndex];

    console.log(
      `Swapping orders: ${fieldAtCurrentIndex.label} (${fieldAtCurrentIndex.order}) <-> ${fieldAtNewIndex.label} (${fieldAtNewIndex.order})`
    );

    // Swap their order values
    const tempOrder = fieldAtCurrentIndex.order;
    fieldAtCurrentIndex.order = fieldAtNewIndex.order;
    fieldAtNewIndex.order = tempOrder;

    // Update the full fields array with the swapped orders
    const updatedFields = fields.map((f) => {
      if (f.id === fieldAtCurrentIndex.id) {
        return { ...f, order: fieldAtCurrentIndex.order };
      }
      if (f.id === fieldAtNewIndex.id) {
        return { ...f, order: fieldAtNewIndex.order };
      }
      return f;
    });

    // Update state immediately for better UX
    setFields(updatedFields);

    const dataToSend = [
      { id: fieldAtCurrentIndex.id, order: fieldAtCurrentIndex.order },
      { id: fieldAtNewIndex.id, order: fieldAtNewIndex.order },
    ];

    console.log("Sending to backend:", dataToSend);

    try {
      // Send only the two affected fields to backend
      const response = await axios.put(
        `${backendUrl}/api/form-fields/reorder`,
        dataToSend,
        { withCredentials: true }
      );

      console.log("Backend response:", response.data);
    } catch (err) {
      console.error("Backend error:", err.response?.data || err.message);
      setError("Failed to reorder fields.");
      // Rollback on error
      fetchFields();
    }
  };

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
                placeholder="e.g. firstName"
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
                placeholder="First Name"
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Group</label>
              <button
                type="button"
                onClick={() => setShowGroupModal(true)}
                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                + Create Group
              </button>
            </div>
            <div className="mt-1 relative">
              <select
                name="group"
                value={newField.group}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.group_key}>
                    {g.group_label}
                  </option>
                ))}
              </select>
              <Boxes className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
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
                  placeholder="apple, orange, mango"
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
        {fields.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <List className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No fields yet
            </h4>
            <p className="text-gray-500">
              Create your first form field using the form above.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((g) => {
              const groupFields = fields
                .filter((f) => f.group === g.group_key)
                .sort((a, b) => a.order - b.order);

              if (groupFields.length === 0) return null;

              return (
                <div
                  key={g.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  {/* Group Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <Layers className="w-4 h-4 mr-2 text-gray-600" />
                        {g.group_label}
                      </h4>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {groupFields.length} field
                        {groupFields.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Fields List */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {groupFields.map((f, index) => (
                        <div
                          key={f.id}
                          className="group relative bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg p-4 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            {/* Field Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                  {index + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h5 className="text-sm font-semibold text-gray-900 truncate">
                                      {f.label}
                                    </h5>
                                    {f.required === 1 && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    <span className="font-mono bg-gray-200 px-2 py-0.5 rounded">
                                      {f.field_name}
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span className="capitalize">{f.type}</span>
                                    {f.options && (
                                      <>
                                        <span className="text-gray-400">•</span>
                                        <span>
                                          {f.options.split(",").length} options
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {/* Move Up */}
                              <button
                                onClick={() => handleMoveField(f.id, -1)}
                                disabled={index === 0}
                                className={`p-2 rounded-md text-xs font-medium transition-colors duration-200 ${
                                  index === 0
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-300 hover:border-blue-300"
                                }`}
                                title="Move up"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                              </button>

                              {/* Move Down */}
                              <button
                                onClick={() => handleMoveField(f.id, 1)}
                                disabled={index === groupFields.length - 1}
                                className={`p-2 rounded-md text-xs font-medium transition-colors duration-200 ${
                                  index === groupFields.length - 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-300 hover:border-blue-300"
                                }`}
                                title="Move down"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(f.id)}
                                className="p-2 rounded-md text-xs font-medium bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-300 transition-colors duration-200"
                                title="Delete field"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Optional: Show options preview for select/radio/checkbox */}
                          {f.options &&
                            ["select", "radio", "checkbox"].includes(
                              f.type
                            ) && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">
                                  Options:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {f.options
                                    .split(",")
                                    .slice(0, 3)
                                    .map((option, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-block bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-600"
                                      >
                                        {option.trim()}
                                      </span>
                                    ))}
                                  {f.options.split(",").length > 3 && (
                                    <span className="inline-block text-xs text-gray-400 px-2 py-1">
                                      +{f.options.split(",").length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

      <Modal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        title="Create New Group"
      >
        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Group Key (unique)
            </label>
            <input
              type="text"
              value={newGroupKey}
              onChange={(e) => setNewGroupKey(e.target.value)}
              placeholder="e.g. vi_health_info"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Group Label
            </label>
            <input
              type="text"
              value={newGroupLabel}
              onChange={(e) => setNewGroupLabel(e.target.value)}
              placeholder="e.g. VI. Health Information"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setShowGroupModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleAddGroup}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Save Group
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FormFieldsPage;
