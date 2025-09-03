import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import PositionList from "./card/PositionList";
import {
  Tags,
  Info,
  SaveIcon,
  PlusCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  List,
  Edit,
} from "lucide-react";

const AddPosition = () => {
  const [formData, setFormData] = useState({ type: "", name: "" });
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Edit state
  const [editingPosition, setEditingPosition] = useState(null);
  const [editForm, setEditForm] = useState({ type: "", name: "" });
  const [showEditModal, setShowEditModal] = useState(false);

  // Confirmation and success modals
  const [showConfirmAdd, setShowConfirmAdd] = useState(false);
  const [showConfirmEdit, setShowConfirmEdit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Fetch positions
  const fetchPositions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/position`, {
        withCredentials: true,
      });
      setPositions(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch positions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Add Position ---
  const handleFinalAdd = async () => {
    setSaving(true);
    try {
      await axios.post(`${backendUrl}/api/position/`, formData, {
        withCredentials: true,
      });
      setFormData({ type: "", name: "" });
      setSuccessMessage("Position added successfully!");
      setShowSuccessModal(true);
      fetchPositions();
    } catch (error) {
      console.error(error);
      setMessage("Failed to add position.");
    } finally {
      setSaving(false);
      setShowConfirmAdd(false);
    }
  };

  // --- Edit Position ---
  const handleEdit = (pos) => {
    setEditingPosition(pos);
    setEditForm({ type: pos.type || "", name: pos.name || "" });
    setShowEditModal(true);
  };

  const handleConfirmEdit = () => {
    setShowEditModal(false);
    setShowConfirmEdit(true);
  };

  const handleFinalEdit = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${backendUrl}/api/position/${editingPosition.id}`,
        {
          name: editForm.name.trim(),
          type: editForm.type,
        },
        { withCredentials: true }
      );
      setEditingPosition(null);
      setSuccessMessage("Position updated successfully!");
      setShowSuccessModal(true);
      fetchPositions();
    } catch (err) {
      console.error(err);
      setMessage("Failed to update position.");
    } finally {
      setSaving(false);
      setShowConfirmEdit(false);
    }
  };

  // --- Delete Position ---
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowConfirmDelete(true);
  };

  const handleFinalDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await axios.delete(`${backendUrl}/api/position/${deleteId}`, {
        withCredentials: true,
      });
      setSuccessMessage("Position deleted successfully!");
      setShowSuccessModal(true);
      fetchPositions();
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete position.");
    } finally {
      setSaving(false);
      setShowConfirmDelete(false);
      setDeleteId(null);
    }
  };

  // --- Group positions ---
  const orgChartPositions = positions.filter((p) => p.type === "orgchart");
  const federationPositions = positions.filter((p) => p.type === "federation");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <PlusCircle className="w-6 h-6 text-indigo-600" /> Add New Position
      </h1>

      {message && (
        <p
          className={`mb-4 ${
            message.includes("Failed")
              ? "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center"
              : "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center"
          }`}
        >
          {message.includes("Failed") ? (
            <XCircle className="w-5 h-5 mr-2" />
          ) : (
            <CheckCircle className="w-5 h-5 mr-2" />
          )}
          {message}
        </p>
      )}

      {/* Add Form */}
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirmAdd(true);
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <div className="mt-1 relative">
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">-- Select Category --</option>
                <option value="orgchart">Organization Chart</option>
                <option value="federation">Municipal Federation</option>
              </select>
              <Tags className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Position Name
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <Info className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            icon={
              saving ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <SaveIcon className="h-4 w-4 mr-2" />
              )
            }
            disabled={saving}
          >
            {saving ? "Adding..." : "Add Position"}
          </Button>
        </div>
      </form>

      {/* Position Lists */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Existing Positions</h3>
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
          </div>
        ) : positions.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <List className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No positions yet
            </h4>
            <p className="text-gray-500">
              Add your first position using the form above.
            </p>
          </div>
        ) : (
          <div>
            <PositionList
              title="Organizational Chart"
              list={orgChartPositions}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
            <PositionList
              title="Municipal Federation"
              list={federationPositions}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          </div>
        )}
      </div>

      {/* Confirm Add Modal */}
      <Modal
        isOpen={showConfirmAdd}
        onClose={() => setShowConfirmAdd(false)}
        title="Confirm Add"
      >
        <div className="mt-4 text-sm text-gray-700">
          Are you sure you want to add this position?
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setShowConfirmAdd(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleFinalAdd}
            disabled={saving}
            className={`px-4 py-2 rounded text-sm ${
              saving
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {saving ? "Saving..." : "Yes, Add"}
          </button>
        </div>
      </Modal>

      {/* Confirm Edit Modal */}
      <Modal
        isOpen={showConfirmEdit}
        onClose={() => setShowConfirmEdit(false)}
        title="Confirm Update"
      >
        <div className="mt-4 text-sm text-gray-700">
          Are you sure you want to update this position?
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setShowConfirmEdit(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleFinalEdit}
            disabled={saving}
            className={`px-4 py-2 rounded text-sm ${
              saving
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {saving ? "Saving..." : "Yes, Update"}
          </button>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        title="Confirm Delete"
      >
        <div className="mt-4 text-sm text-gray-700">
          Are you sure you want to delete this position?
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setShowConfirmDelete(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleFinalDelete}
            disabled={saving}
            className={`px-4 py-2 rounded text-sm ${
              saving
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            } text-white`}
          >
            {saving ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title=""
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Success</h3>
          <p className="text-sm text-gray-600 mb-4">{successMessage}</p>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Position"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="type"
              value={editForm.type}
              onChange={(e) =>
                setEditForm({ ...editForm, type: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="orgchart">Organization Chart</option>
              <option value="federation">Municipal Federation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Position Name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmEdit}
            disabled={saving}
            className={`px-4 py-2 rounded text-sm ${
              saving
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AddPosition;
