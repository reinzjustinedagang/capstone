import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import CropperModal from "../UI/CropperModal";
import {
  SaveIcon,
  Loader2,
  Target,
  ScrollText,
  ImagePlus,
  CheckCircle,
} from "lucide-react";

const AboutUs = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    objective: "",
    introduction: "",
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

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/settings/about-us`, {
          withCredentials: true,
        });
        setSettings({
          ...res.data,
          team: res.data.team || [],
        });
      } catch (err) {
        console.error("Failed to fetch system settings:", err);
      }
    };
    fetchSettings();
  }, [backendUrl]);

  /** File selection */
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

  /** Add / Update member */
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

  /** Edit member */
  const handleEditMember = (member, index) => {
    setTeamMember(member);
    setEditingIndex(index);
  };

  /** Delete member */
  const handleDeleteMember = (index) => {
    setSettings((prev) => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index),
    }));
  };

  /** Save All */
  const handleSaveAll = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("introduction", settings.introduction);
      formData.append("objective", settings.objective);

      // prepare team data (excluding raw files)
      const teamData = settings.team.map((m) => ({
        name: m.name,
        role: m.role,
        image: m.image || null,
        public_id: m.public_id || null,
      }));
      formData.append("team", JSON.stringify(teamData));

      // attach only new/updated images
      settings.team.forEach((member, index) => {
        if (member.imageFile) {
          formData.append(`teamImages`, member.imageFile);
          formData.append(`teamIndexes`, index);
        }
      });

      const response = await axios.post(
        `${backendUrl}/api/settings/about-us`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setSettings((prev) => ({
        ...prev,
        introduction: response.data.introduction,
        objective: response.data.objective,
        team: response.data.team,
      }));

      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error saving About Us:", err);
      alert("Failed to update. Please try again.");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 space-y-6">
        {/* Introduction */}
        <div>
          <label className="block text-base font-medium text-gray-700">
            Introduction
          </label>
          <div className="mt-1 relative">
            <textarea
              value={settings.introduction}
              onChange={(e) =>
                setSettings({ ...settings, introduction: e.target.value })
              }
              className="w-full border rounded-md shadow-sm py-2 px-3 pl-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows={4}
            />
            <ScrollText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Objectives */}
        <div>
          <label className="block text-base font-medium text-gray-700">
            Objectives
          </label>
          <div className="mt-1 relative">
            <textarea
              value={settings.objective}
              onChange={(e) =>
                setSettings({ ...settings, objective: e.target.value })
              }
              className="w-full border rounded-md shadow-sm py-2 px-3 pl-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows={3}
            />
            <Target className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Team Management */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Team Members</h3>

          {/* Add/Edit Team */}
          <div className="grid md:grid-rows-1 justify-start gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium">Image</label>
              <div className="flex items-center gap-4 mt-2">
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
                  className="px-3 py-1 border rounded flex items-center gap-1 text-sm"
                >
                  <ImagePlus size={16} />
                  {teamMember.imagePreview ? "Change" : "Upload"}
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

            <input
              type="text"
              placeholder="Name"
              value={teamMember.name}
              onChange={(e) =>
                setTeamMember({ ...teamMember, name: e.target.value })
              }
              className="border px-3 py-2 rounded"
            />
            <input
              type="text"
              placeholder="Role"
              value={teamMember.role}
              onChange={(e) =>
                setTeamMember({ ...teamMember, role: e.target.value })
              }
              className="border px-3 py-2 rounded"
            />
            <Button onClick={handleAddOrUpdateMember} variant="primary">
              {editingIndex !== null ? "Update" : "Add"}
            </Button>
          </div>

          {/* Team List */}
          <div className="grid md:grid-cols-3 gap-4">
            {(settings.team || []).map((member, index) => (
              <div
                key={index}
                className="border p-3 rounded text-center shadow-sm relative"
              >
                <img
                  src={member.imagePreview || member.image || ""}
                  alt={member.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                />
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm">{member.role}</p>
                <div className="flex justify-center mt-2 space-x-2">
                  <button
                    className="px-2 py-1 bg-yellow-400 text-white rounded text-sm"
                    onClick={() => handleEditMember(member, index)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                    onClick={() => handleDeleteMember(index)}
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
            variant="primary"
            onClick={() => setShowConfirmModal(true)}
            icon={
              loading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <SaveIcon className="h-4 w-4 mr-2" />
              )
            }
            disabled={loading}
          >
            {loading ? "Saving..." : "Save All"}
          </Button>
        </div>
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
        <div className="mt-4 text-sm text-gray-700">
          Are you sure you want to save changes to About Us?
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAll}
            disabled={loading}
            className={`px-4 py-2 rounded text-sm ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
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
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default AboutUs;
