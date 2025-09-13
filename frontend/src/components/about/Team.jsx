import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import CropperModal from "../UI/CropperModal";
import { ImagePlus, Loader2, SaveIcon, CheckCircle } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/settings/team`, {
          withCredentials: true,
        });
        setTeam(res.data);
      } catch (err) {
        console.error("Failed to fetch team:", err);
      }
    };
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

  const handleAddOrUpdateMember = () => {
    if (!teamMember.name || !teamMember.role) return;
    if (editingIndex !== null) {
      const updated = [...team];
      updated[editingIndex] = teamMember;
      setTeam(updated);
      setEditingIndex(null);
    } else {
      setTeam([...team, teamMember]);
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

  const handleEditMember = (member, index) => {
    setTeamMember(member);
    setEditingIndex(index);
  };

  const handleDeleteMember = (index) => {
    setTeam((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveTeam = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Prepare team data with only JSON-safe fields
      const teamData = team.map((member) => ({
        name: member.name,
        role: member.role,
        image: member.image || null,
        public_id: member.public_id || null,
      }));

      // Append team as JSON string
      formData.append("team", JSON.stringify(teamData));

      // Append image files and their indexes
      team.forEach((member, index) => {
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

      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to save team:", err);
      alert("Failed to save team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 space-y-6">
        <h3 className="text-lg font-semibold mb-3">Team Members</h3>

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
                <ImagePlus size={16} />{" "}
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

        <div className="grid md:grid-cols-3 gap-4">
          {team.map((member, index) => (
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

        <div className="flex justify-end mt-4">
          <Button
            variant="primary"
            onClick={handleSaveTeam}
            icon={
              loading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <SaveIcon className="h-4 w-4 mr-2" />
              )
            }
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Team"}
          </Button>
        </div>
      </div>

      {showCropper && rawImage && (
        <CropperModal
          imageSrc={rawImage}
          onClose={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
          aspect={1}
        />
      )}

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
            Team updated successfully!
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
