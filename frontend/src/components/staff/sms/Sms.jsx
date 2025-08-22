import React, { useState, useEffect } from "react";
import { SendIcon, SaveIcon } from "lucide-react";
import Button from "../../UI/Button";
import MessageTemplates from "../../sms/MessageTemplates";
import MessageHistory from "../../sms/MessageHistory";
import axios from "axios"; // ✅ Add this at the top

const Sms = () => {
  const [activeTab, setActiveTab] = useState("send");
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("");
  const [seniorCitizens, setSeniorCitizens] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchData = async () => {
    try {
      const [citizensRes, templatesRes] = await Promise.all([
        axios.get(`${backendUrl}/api/senior-citizens/sms-citizens`),
        axios.get(`${backendUrl}/api/templates/`),
      ]);
      setSeniorCitizens(citizensRes.data);
      setTemplates(templatesRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "send") {
      fetchData(); // re-fetch on tab switch
    }
  }, [activeTab]);

  const handleSelectAll = (e) => {
    const filtered = filteredCitizens.map((c) => c.id);
    if (e.target.checked) {
      setSelectedRecipients(filtered);
    } else {
      setSelectedRecipients([]);
    }
  };

  const handleSelectRecipient = (id) => {
    if (selectedRecipients.includes(id)) {
      setSelectedRecipients(
        selectedRecipients.filter((recipientId) => recipientId !== id)
      );
    } else {
      setSelectedRecipients([...selectedRecipients, id]);
    }
  };

  const handleTemplateChange = async (e) => {
    const selectedId = e.target.value;
    setSelectedTemplateId(selectedId);

    if (selectedId) {
      try {
        const res = await axios.get(
          `${backendUrl}/api/templates/${selectedId}`
        );
        const template = res.data;
        setMessageText(template.message);
      } catch (err) {
        console.error("Failed to load template message", err);
      }
    } else {
      setMessageText("");
    }
  };

  const handleSendMessage = async () => {
    try {
      const numbers = seniorCitizens
        .filter((c) => selectedRecipients.includes(c.id))
        .map((c) => c.contact);

      const response = await axios.post(`${backendUrl}/api/sms/send-sms`, {
        numbers,
        message: messageText,
      });

      alert(response.data.message); // shows "✅ Broadcast sent successfully"
      setMessageText("");
      setSelectedRecipients([]);
    } catch (err) {
      console.error("Failed to send SMS", err);
      alert(err.response?.data?.message || "Failed to send messages.");
    }
  };

  const uniqueBarangays = Array.from(
    new Set(seniorCitizens.map((c) => c.barangay))
  );

  const filteredCitizens = barangayFilter
    ? seniorCitizens.filter((c) => c.barangay === barangayFilter)
    : seniorCitizens;

  return (
    <div>
      {/* <h1 className="text-2xl font-bold mb-6">SMS Management</h1> */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recipients */}
            <div>
              <h2 className="text-lg font-medium mb-4 text-blue-700">
                Select Recipients
              </h2>
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="selectAll"
                      onChange={handleSelectAll}
                      checked={
                        selectedRecipients.length > 0 &&
                        filteredCitizens.every((c) =>
                          selectedRecipients.includes(c.id)
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="selectAll"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Select All
                    </label>
                    <span className="ml-auto text-sm text-gray-500">
                      {selectedRecipients.length} selected
                    </span>
                  </div>
                  <div className="mt-4">
                    <label
                      htmlFor="barangayFilter"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Filter by Barangay
                    </label>
                    <select
                      id="barangayFilter"
                      value={barangayFilter}
                      onChange={(e) => setBarangayFilter(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">All Barangays</option>
                      {uniqueBarangays.map((brgy, index) => (
                        <option key={index} value={brgy}>
                          {brgy}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {filteredCitizens.map((citizen) => (
                    <div
                      key={citizen.id}
                      className="px-4 py-2 border-b border-gray-200 last:border-b-0 flex items-center"
                    >
                      <input
                        type="checkbox"
                        id={`citizen-${citizen.id}`}
                        checked={selectedRecipients.includes(citizen.id)}
                        onChange={() => handleSelectRecipient(citizen.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`citizen-${citizen.id}`}
                        className="ml-2 flex-1"
                      >
                        <div className="text-sm font-medium text-gray-700">
                          {citizen.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {citizen.contact}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compose Message */}
            <div>
              <h2 className="text-lg font-medium mb-4 text-blue-700">
                Compose Message
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="template"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Select Template (Optional)
                  </label>
                  <select
                    id="template"
                    value={selectedTemplateId}
                    onChange={handleTemplateChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">-- Select a template --</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message here..."
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  ></textarea>
                  <p className="mt-2 text-sm text-gray-500 flex justify-between">
                    <span></span>
                    <span>{messageText.length} / 160 characters</span>
                  </p>
                </div>
                <div className="flex justify-between">
                  <span></span>
                  <Button
                    variant="primary"
                    onClick={handleSendMessage}
                    disabled={selectedRecipients.length === 0 || !messageText}
                    icon={<SendIcon className="h-4 w-4 mr-2" />}
                  >
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sms;
