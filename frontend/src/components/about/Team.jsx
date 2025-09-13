import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import CropperModal from "../UI/CropperModal";
import {
  ImagePlus,
  Loader2,
  CheckCircle,
  Plus,
  UserPlus,
  Trash2,
} from "lucide-react";

const Team = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [team, setTeam] = useState([]);
  const [teamMember, setTeamMember] = useState({
    name: "",
    role: "",
    imageFile: null,
    imagePreview: null,
    image: null,
    public_id: null,
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [rawImage, setRawImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const fileInputRef = useRef(null);

  // Extract fetchTeam function so it can be reused
  const fetchTeam = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/settings/team`, {
        withCredentials: true,
      });
      console.log("Fetched team data:", res.data); // Debug log

      // Ensure we have an array
      const teamData = Array.isArray(res.data) ? res.data : [];
      setTeam(teamData);
    } catch (err) {
      console.error("Failed to fetch team:", err);
      setTeam([]); // Set empty array on error
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [backendUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRawImage(URL.createObjectURL(file));
    setShowCropper(true);
  };

  const handleCropComplete = (croppedBlob) => {
    const fileName = `team_${Date.now()}.png`;
    const croppedFile = new File([croppedBlob], fileName, {
      type: "image/png",
    });
    setTeamMember((prev) => ({
      ...prev,
      imageFile: croppedFile,
      imagePreview: URL.createObjectURL(croppedFile),
    }));
    setShowCropper(false);
    setRawImage(null);
  };

  const handleOpenAddModal = () => {
    setTeamMember({
      name: "",
      role: "",
      imageFile: null,
      imagePreview: null,
      image: null,
      public_id: null,
    });
    setEditingIndex(null);
    setShowTeamModal(true);
  };

  const handleOpenEditModal = (member, index) => {
    setTeamMember(member);
    setEditingIndex(index);
    setShowTeamModal(true);
  };

  const handleAddOrUpdateMember = async () => {
    if (!teamMember.name || !teamMember.role) return;

    setLoading(true);
    try {
      let updatedTeam;

      if (editingIndex !== null) {
        updatedTeam = [...team];
        updatedTeam[editingIndex] = teamMember;
      } else {
        updatedTeam = [...team, teamMember];
      }

      // Prepare form data for backend
      const formData = new FormData();
      const teamData = updatedTeam.map((member) => ({
        name: member.name,
        role: member.role,
        image: member.image || null,
        public_id: member.public_id || null,
      }));

      formData.append("team", JSON.stringify(teamData));

      // Append image files and their indexes
      updatedTeam.forEach((member, index) => {
        if (member.imageFile) {
          formData.append("teamImages", member.imageFile);
          formData.append("teamIndexes", index.toString());
        }
      });

      // Send to backend
      await axios.post(`${backendUrl}/api/settings/team`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      // Refresh team data from database after successful save
      await fetchTeam();

      // Close modal and reset form
      setShowTeamModal(false);
      setTeamMember({
        name: "",
        role: "",
        imageFile: null,
        imagePreview: null,
        image: null,
        public_id: null,
      });
      setEditingIndex(null);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to save team member:", err);
      alert("Failed to save team member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (member, index) => {
    setMemberToDelete({ member, index });
    setShowDeleteModal(true);
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    setLoading(true);
    try {
      const updatedTeam = team.filter((_, i) => i !== memberToDelete.index);

      // Prepare form data for backend
      const formData = new FormData();
      const teamData = updatedTeam.map((member) => ({
        name: member.name,
        role: member.role,
        image: member.image || null,
        public_id: member.public_id || null,
      }));

      formData.append("team", JSON.stringify(teamData));

      // Send to backend
      await axios.post(`${backendUrl}/api/settings/team`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      // Refresh team data from database
      await fetchTeam();

      setShowDeleteModal(false);
      setMemberToDelete(null);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to delete team member:", err);
      alert("Failed to delete team member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowTeamModal(false);
    setTeamMember({
      name: "",
      role: "",
      imageFile: null,
      imagePreview: null,
      image: null,
      public_id: null,
    });
    setEditingIndex(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Team Members</h3>
          <Button
            onClick={handleOpenAddModal}
            variant="primary"
            icon={<Plus className="h-4 w-4 mr-2" />}
          >
            Add Member
          </Button>
        </div>

        {team.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <UserPlus className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No team members added yet.</p>
            <p className="text-sm">Click "Add Member" to get started.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {team.map((member, index) => (
              <div
                key={index}
                className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow relative bg-white"
              >
                <div className="text-center">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-3 border-2 border-gray-200">
                      No Image
                    </div>
                  )}
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">{member.role}</p>

                  <div className="flex justify-center gap-2">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                      onClick={() => handleOpenEditModal(member, index)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                      onClick={() => handleDeleteClick(member, index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Team Member Modal */}
      <Modal
        isOpen={showTeamModal}
        onClose={!loading ? handleCloseModal : undefined}
        title={editingIndex !== null ? "Edit Team Member" : "Add Team Member"}
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Image</label>
            <div className="flex items-center gap-4">
              {teamMember.imagePreview || teamMember.image ? (
                <img
                  src={teamMember.imagePreview || teamMember.image}
                  alt="Preview"
                  className="w-20 h-20 rounded-full border object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={loading}
                className="px-3 py-2 border rounded flex items-center gap-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                <ImagePlus size={16} />
                {teamMember.imagePreview || teamMember.image
                  ? "Change"
                  : "Upload"}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              placeholder="Enter member name"
              value={teamMember.name}
              disabled={loading}
              onChange={(e) =>
                setTeamMember({ ...teamMember, name: e.target.value })
              }
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <input
              type="text"
              placeholder="Enter member role"
              value={teamMember.role}
              disabled={loading}
              onChange={(e) =>
                setTeamMember({ ...teamMember, role: e.target.value })
              }
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddOrUpdateMember}
              variant="primary"
              disabled={!teamMember.name || !teamMember.role || loading}
              icon={
                loading ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : null
              }
            >
              {loading
                ? editingIndex !== null
                  ? "Updating..."
                  : "Adding..."
                : editingIndex !== null
                ? "Update Member"
                : "Add Member"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={!loading ? () => setShowDeleteModal(false) : undefined}
        title="Delete Team Member"
      >
        <div className="p-6">
          <p className="mb-4 text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-red-600">
              {memberToDelete?.member?.name || "this team member"}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteMember}
              disabled={loading}
              icon={
                loading ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )
              }
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cropper Modal */}
      {showCropper && rawImage && (
        <CropperModal
          imageSrc={rawImage}
          onClose={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
          aspect={1}
        />
      )}

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
          <p className="text-sm text-gray-600 mb-4">
            Team member saved successfully!
          </p>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default Team;
