import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import TeamCard from "./team/TeamCard";
import TeamForm from "./team/TeamForm";
import Modal from "../UI/Modal";
import { Loader2, CheckCircle, Trash2, PlusCircle } from "lucide-react";
import CropperModal from "../UI/CropperModal";
import Button from "../UI/Button";

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
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const fileInputRef = useRef(null);

  // Fetch team data
  const fetchTeam = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/settings/team`, {
        withCredentials: true,
      });
      const teamData = Array.isArray(res.data) ? res.data : [];
      setTeam(teamData);
    } catch (err) {
      console.error("Failed to fetch team:", err);
      setTeam([]);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [backendUrl]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRawImage(URL.createObjectURL(file));
    setShowCropper(true);
  };

  // Handle cropped image
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

  // Open add modal
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
    setShowFormModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (member, index) => {
    setTeamMember(member);
    setEditingIndex(index);
    setShowFormModal(true);
  };

  // Add or update member
  const handleAddOrUpdateMember = async () => {
    if (!teamMember.name || !teamMember.role) return;
    setLoading(true);

    try {
      let updatedTeam = [...team];
      if (editingIndex !== null) {
        updatedTeam[editingIndex] = teamMember;
      } else {
        updatedTeam.push(teamMember);
      }

      const formData = new FormData();
      const teamData = updatedTeam.map((m) => ({
        name: m.name,
        role: m.role,
        image: m.image || null,
        public_id: m.public_id || null,
      }));

      formData.append("team", JSON.stringify(teamData));

      // Append images
      updatedTeam.forEach((member, index) => {
        if (member.imageFile) {
          formData.append("teamImages", member.imageFile);
          formData.append("teamIndexes", index.toString());
        }
      });

      await axios.post(`${backendUrl}/api/settings/team`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      await fetchTeam();
      setShowFormModal(false);
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

  // Open delete modal
  const handleDeleteClick = (member, index) => {
    setMemberToDelete({ member, index });
    setShowDeleteModal(true);
  };

  // Delete member
  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    setLoading(true);

    try {
      const updatedTeam = team.filter((_, i) => i !== memberToDelete.index);

      const formData = new FormData();
      const teamData = updatedTeam.map((m) => ({
        name: m.name,
        role: m.role,
        image: m.image || null,
        public_id: m.public_id || null,
      }));

      formData.append("team", JSON.stringify(teamData));

      await axios.post(`${backendUrl}/api/settings/team`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

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

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Team Members</h3>
          <Button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={handleOpenAddModal}
            icon={<PlusCircle className="h-4 w-4" />}
          >
            Add Member
          </Button>
        </div>

        {team.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No team members added yet.</p>
            <p className="text-sm">Click "Add Member" to get started.</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {team.map((member, index) => (
              <TeamCard
                key={index}
                member={member}
                onEdit={() => handleOpenEditModal(member, index)}
                onDelete={() => handleDeleteClick(member, index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Team Form Modal */}
      <TeamForm
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleAddOrUpdateMember}
        formData={teamMember}
        setFormData={setTeamMember}
        handleFileChange={handleFileChange}
        existingImage={teamMember.image}
        loading={loading}
        editingIndex={editingIndex}
      />

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
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={loading}
              className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteMember}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </button>
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
          <button
            onClick={() => setShowSuccessModal(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Team;
