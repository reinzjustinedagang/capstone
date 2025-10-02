import React, { useEffect, useState } from "react";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  ImageIcon,
  Loader2,
  MessageSquareCode,
  MessageSquareQuote,
} from "lucide-react";
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
  const [addLoading, setAddLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    if (!newTemplate.name || !newTemplate.message) {
      setError("All fields are required.");
      return;
    }
    try {
      setAddLoading(true);
      await axios.post(`${backendUrl}/api/templates/`, newTemplate, {
        withCredentials: true,
      });

      setShowAddModal(false);
      fetchTemplates();
      setNewTemplate({ name: "", category: "", message: "" });
      setError("");
    } catch (err) {
      console.error("Add failed", err);
      setError("Failed to add template.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateTemplate = async () => {
    try {
      setUpdateLoading(true);
      await axios.put(
        `${backendUrl}/api/templates/${selectedTemplate.id}`,
        selectedTemplate,
        { withCredentials: true }
      );

      setShowEditModal(false);
      fetchTemplates();
      setError("");
    } catch (err) {
      console.error("Update failed", err);
      setError("Failed to update template.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await axios.delete(`${backendUrl}/api/templates/${selectedTemplate.id}`, {
        withCredentials: true,
      });

      setShowDeleteModal(false);
      fetchTemplates();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeleteLoading(false);
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
      <div className="flex justify-end items-center mb-6">
        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          icon={<PlusIcon className="h-4 w-4 mr-2" />}
        >
          Add Template
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">
            Loading message template...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.length === 0 ? (
            <div className="text-center py-16 text-gray-400 col-span-full">
              <MessageSquareQuote className="w-12 h-12 mx-auto mb-4" />
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
                    <h3 className="text-sm font-medium">{template.name}</h3>
                    {/* <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                      {template.category}
                    </span> */}
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
            {/* <div>
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
            </div> */}
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
                maxLength={160}
              ></textarea>
              {/* ✅ Character counter */}
              <p className="mt-2 text-sm text-gray-500 text-right">
                {newTemplate.message.length} / 160 characters
              </p>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddTemplate}
                disabled={addLoading}
              >
                {addLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
                  </>
                ) : (
                  "Save Template"
                )}
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
            {/* <div>
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
            </div> */}
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
                maxLength={160}
                onChange={(e) =>
                  setSelectedTemplate({
                    ...selectedTemplate,
                    message: e.target.value,
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
              {/* ✅ Character counter */}
              <p className="mt-2 text-sm text-gray-500 text-right">
                {selectedTemplate?.message?.length || 0} / 160 characters
              </p>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateTemplate}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                    Updating...
                  </>
                ) : (
                  "Update Template"
                )}
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
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default MessageTemplates;
