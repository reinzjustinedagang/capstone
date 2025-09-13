import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../UI/Button";
import Modal from "../UI/Modal";

const AboutUs = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [settings, setSettings] = useState({
    introduction: "",
    objective: "",
    team: [],
  });
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`${backendUrl}/api/settings/`);
      setSettings({
        introduction: res.data.introduction || "",
        objective: res.data.objective || "",
        team: res.data.team || [],
      });
    };
    fetchData();
  }, []);

  const handleFileChange = (index, file) => {
    setFiles({ ...files, [index]: file });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("introduction", settings.introduction);
      formData.append("objective", settings.objective);
      formData.append("team", JSON.stringify(settings.team));

      settings.team.forEach((member, i) => {
        if (files[i]) {
          formData.append("teamImages", files[i]);
          formData.append("teamIndexes", i);
        }
      });

      await axios.post(`${backendUrl}/api/settings/about-us`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("About Us updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update About Us");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-6 space-y-4">
      <div>
        <label>Introduction</label>
        <textarea
          value={settings.introduction}
          onChange={(e) =>
            setSettings({ ...settings, introduction: e.target.value })
          }
          rows={3}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label>Objective</label>
        <textarea
          value={settings.objective}
          onChange={(e) =>
            setSettings({ ...settings, objective: e.target.value })
          }
          rows={3}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Team Members */}
      <div>
        <h4 className="font-semibold mb-2">Team Members</h4>
        {settings.team.map((member, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={member.name}
              placeholder="Name"
              onChange={(e) => {
                const newTeam = [...settings.team];
                newTeam[i].name = e.target.value;
                setSettings({ ...settings, team: newTeam });
              }}
              className="border rounded p-1"
            />
            <input
              type="text"
              value={member.role}
              placeholder="Role"
              onChange={(e) => {
                const newTeam = [...settings.team];
                newTeam[i].role = e.target.value;
                setSettings({ ...settings, team: newTeam });
              }}
              className="border rounded p-1"
            />
            <input
              type="file"
              onChange={(e) => handleFileChange(i, e.target.files[0])}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save About Us"}
        </Button>
      </div>
    </div>
  );
};

export default AboutUs;
