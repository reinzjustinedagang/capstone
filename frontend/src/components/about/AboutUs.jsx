import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import CropperModal from "../UI/CropperModal";
import { SaveIcon, Loader2, ImagePlus, CheckCircle } from "lucide-react";

const AboutUs = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    introduction: "",
    objective: "",
    team: [],
  });

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
  const fileInputRef = useRef(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  /** Fetch current About Us settings */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/settings/about-us`, {
          withCredentials: true,
        });
        setSettings({
          introduction: res.data.introduction || "",
          objective: res.data.objective || "",
          team: res.data.team || [],
        });
      } catch (err) {
        console.error("Failed to fetch About Us:", err);
      }
    };
    fetchSettings();
  }, []);

  /** Handle file selection */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type.toLowerCase())) return;

    setRawImage(URL.createObjectURL(file));
    setShowCropper(true);
  };

  /** After cropping */
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

  /** Add / Update Team Member */
  const handleAddOrUpdateMember = () => {
    if (!teamMember.name || !teamMember.role) return;

    if (editingIndex !== null) {
      const updatedTeam = [...settings.team];
      updatedTeam[editingIndex] = teamMember;
      setSettings((prev) => ({ ...prev, team: updatedTeam }));
      setEditingIndex(null);
    } else {
      setSettings((prev) => ({
        ...prev,
        team: [...prev.team, teamMember],
      }));
    }

    setTeamMember({
      name: "",
      role: "",
      imageFile: null,
      imagePreview: null,
      image: null,
      public_id: null,
    });
  };

  /** Edit / Delete */
  const handleEditMember = (member, index) => {
    setTeamMember(member);
    setEditingIndex(index);
  };

  const handleDeleteMember = (index) => {
    setSettings((prev) => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index),
    }));
    if (editingIndex === index) setEditingIndex(null);
  };

  /** Save All (handles Cloudinary upload) */
  const handleSaveAll = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("introduction", settings.introduction);
      formData.append("objective", settings.objective);

      // Append team data (without images)
      const teamData = settings.team.map((m) => ({
        name: m.name,
        role: m.role,
        image: m.image || null,
        public_id: m.public_id || null,
      }));
      formData.append("team", JSON.stringify(teamData));

      // Append new/updated images
      settings.team.forEach((member, index) => {
        if (member.imageFile) {
          formData.append("teamImages", member.imageFile);
          formData.append("teamIndexes", index);
        }
      });

      await axios.post(`${backendUrl}/api/settings/about-us`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to update About Us:", err);
      alert("Error updating About Us. Check console for details.");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">
      {/* Introduction */}
      <div>
        <label>Introduction</label>
        <textarea
          className="w-full border rounded p-2"
          value={settings.introduction}
          onChange={(e) =>
            setSettings({ ...settings, introduction: e.target.value })
          }
        />
      </div>

      {/* Objective */}
      <div>
        <label>Objective</label>
        <textarea
          className="w-full border rounded p-2"
          value={settings.objective}
          onChange={(e) =>
            setSettings({ ...settings, objective: e.target.value })
          }
        />
      </div>

      {/* Team Members */}
      <div>
        <label>Team Members</label>
        <div className="flex gap-4 mb-4 items-center">
          <div>
            {teamMember.imagePreview || teamMember.image ? (
              <img
                src={teamMember.imagePreview || teamMember.image}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                No Image
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="border px-3 py-1 rounded flex items-center gap-1"
          >
            <ImagePlus size={16} />{" "}
            {teamMember.imagePreview ? "Change" : "Upload"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
          />
          <input
            type="text"
            placeholder="Name"
            value={teamMember.name}
            onChange={(e) =>
              setTeamMember({ ...teamMember, name: e.target.value })
            }
            className="border px-2 py-1 rounded"
          />
          <input
            type="text"
            placeholder="Role"
            value={teamMember.role}
            onChange={(e) =>
              setTeamMember({ ...teamMember, role: e.target.value })
            }
            className="border px-2 py-1 rounded"
          />
          <Button onClick={handleAddOrUpdateMember}>
            {editingIndex !== null ? "Update" : "Add"}
          </Button>
        </div>

        {/* List */}
        <div className="grid md:grid-cols-3 gap-4">
          {settings.team.map((member, idx) => (
            <div key={idx} className="border p-3 rounded text-center">
              <img
                src={member.image || ""}
                alt={member.name}
                className="w-20 h-20 mx-auto rounded-full object-cover mb-2"
              />
              <p className="font-semibold">{member.name}</p>
              <p className="text-sm">{member.role}</p>
              <div className="flex justify-center gap-2 mt-2">
                <button
                  onClick={() => handleEditMember(member, idx)}
                  className="px-2 py-1 bg-yellow-400 text-white rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteMember(idx)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save All */}
      <div className="flex justify-end mt-4">
        <Button
          onClick={() => setShowConfirmModal(true)}
          disabled={loading}
          icon={
            loading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <SaveIcon className="h-4 w-4" />
            )
          }
        >
          {loading ? "Saving..." : "Save All"}
        </Button>
      </div>

      {/* Cropper Modal */}
      {showCropper && rawImage && (
        <CropperModal
          imageSrc={rawImage}
          onClose={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
          aspect={1}
        />
      )}

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Update"
      >
        <div className="mt-2">Are you sure you want to save changes?</div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAll}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Saving..." : "Yes, Save"}
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
          <p className="text-sm text-gray-600 mb-4">
            About Us updated successfully!
          </p>
          <Button onClick={() => setShowSuccessModal(false)}>OK</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AboutUs;
