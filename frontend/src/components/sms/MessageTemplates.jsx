import React, { useEffect, useState } from "react";
import { PlusIcon, EditIcon, TrashIcon, ImageIcon } from "lucide-react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import axios from "axios";

const MessageTemplates = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "",
    message: "",
  });

  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/templates/`);
      setTemplates(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    }
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name || !newTemplate.category || !newTemplate.message) {
      setError("All fields are required.");
      return;
    }
    try {
      await axios.post(`${backendUrl}/api/templates/`, newTemplate, {
        withCredentials: true,
      });

      setShowAddModal(false);
      fetchTemplates();
      setNewTemplate({ name: "", category: "", message: "" });
      setError(""); // clear error
    } catch (err) {
      console.error("Add failed", err);
      setError("Failed to add template.");
    }
  };

  const handleUpdateTemplate = async () => {
    try {
      await axios.put(
        `${backendUrl}/api/templates/${selectedTemplate.id}`,
        selectedTemplate,
        {
          withCredentials: true,
        }
      );

      setShowEditModal(false);
      fetchTemplates();
      setError("");
    } catch (err) {
      console.error("Update failed", err);
      setError("Failed to update template.");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${backendUrl}/api/templates/${selectedTemplate.id}`, {
        withCredentials: true,
      });

      setShowDeleteModal(false);
      fetchTemplates();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setShowEditModal(true);
  };

  const handleDelete = (template) => {
    setSelectedTemplate(template);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Message Templates</h2>
        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          icon={<PlusIcon className="h-4 w-4 mr-2" />}
        >
          Add Template
        </Button>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading templates...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.length === 0 ? (
            <div className="text-center py-16 text-gray-400 col-span-full">
              <ImageIcon className="w-12 h-12 mx-auto mb-4" />
              <p className="text-sm">No message templates found.</p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-md overflow-hidden"
              >
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                      {template.category}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-sm text-gray-600">{template.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {/* Add Template Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Message Template"
      >
        <div className="p-6">
          <form className="space-y-4">
            <div>
              <label
                htmlFor="templateName"
                className="block text-sm font-medium text-gray-700"
              >
                Template Name
              </label>
              <input
                type="text"
                id="templateName"
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, name: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Birthday Greeting"
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                value={newTemplate.category}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, category: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select category</option>
                <option value="Financial">Financial</option>
                <option value="Health">Health</option>
                <option value="Community">Community</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                Message Content
              </label>
              <textarea
                id="message"
                value={newTemplate.message}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, message: e.target.value })
                }
                rows={5}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Type your message template here."
              ></textarea>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddTemplate}>
                Save Template
              </Button>
            </div>
          </form>
        </div>
      </Modal>
      {/* Edit Template Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Message Template"
      >
        <div className="p-6">
          <form className="space-y-4">
            <div>
              <label
                htmlFor="editTemplateName"
                className="block text-sm font-medium text-gray-700"
              >
                Template Name
              </label>
              <input
                type="text"
                id="editTemplateName"
                value={selectedTemplate?.name || ""}
                onChange={(e) =>
                  setSelectedTemplate({
                    ...selectedTemplate,
                    name: e.target.value,
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="editCategory"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="editCategory"
                value={selectedTemplate?.category || ""}
                onChange={(e) =>
                  setSelectedTemplate({
                    ...selectedTemplate,
                    category: e.target.value,
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Financial">Financial</option>
                <option value="Health">Health</option>
                <option value="Community">Community</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="editContent"
                className="block text-sm font-medium text-gray-700"
              >
                Message Content
              </label>
              <textarea
                id="editContent"
                rows={5}
                value={selectedTemplate?.message || ""}
                onChange={(e) =>
                  setSelectedTemplate({
                    ...selectedTemplate,
                    message: e.target.value,
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpdateTemplate}>
                Update Template
              </Button>
            </div>
          </form>
        </div>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to delete the "{selectedTemplate?.name}"
            template? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default MessageTemplates;
