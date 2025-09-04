import React, { useState, useEffect } from "react";
import { SendIcon, Loader2, Search } from "lucide-react";
import Button from "../UI/Button";
import MessageTemplates from "./MessageTemplates";
import MessageHistory from "./MessageHistory";
import axios from "axios";

const Sms = () => {
  const [activeTab, setActiveTab] = useState("send");
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("");
  const [barangays, setBarangays] = useState([]);
  const [seniorCitizens, setSeniorCitizens] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  // Fetch barangays
  const fetchBarangays = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/barangays/all`);
      setBarangays(res.data || []); // API returns array directly
    } catch (err) {
      console.error("Failed to fetch barangays:", err);
      setBarangays([]);
    }
  };

  // Fetch senior citizens by barangay ID
  const fetchCitizens = async (barangayId = "", search = "") => {
    try {
      setLoading(true);
      const params = {};
      if (barangayId) params.barangay_id = barangayId;
      if (search) params.search = search;

      const res = await axios.get(
        `${backendUrl}/api/senior-citizens/sms-citizens`,
        { params }
      );

      const citizens = res.data || [];
      setSeniorCitizens(citizens);
      setSelectedRecipients([]);
    } catch (err) {
      console.error("Failed to fetch citizens:", err);
      setSeniorCitizens([]);
      setSelectedRecipients([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/templates/`);
      setTemplates(res.data || []);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      setTemplates([]);
    }
  };

  useEffect(() => {
    fetchBarangays();
    fetchCitizens();
    fetchTemplates();
  }, []);

  const handleSelectRecipient = (id) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    setSelectedRecipients(
      e.target.checked ? seniorCitizens.map((c) => c.id) : []
    );
  };

  const handleTemplateChange = async (e) => {
    const selectedId = e.target.value;
    setSelectedTemplateId(selectedId);
    if (!selectedId) return setMessageText("");

    try {
      const res = await axios.get(`${backendUrl}/api/templates/${selectedId}`);
      setMessageText(res.data?.message || "");
    } catch (err) {
      console.error("Failed to load template:", err);
    }
  };

  const handleSendMessage = async () => {
    const numbers = seniorCitizens
      .filter((c) => selectedRecipients.includes(c.id))
      .map((c) => c.contact);

    if (!numbers.length || !messageText) return;

    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/sms/send-sms`, {
        numbers,
        message: messageText,
      });

      const msg =
        res.data?.message ||
        res.data?.response?.data?.message ||
        "✅ Broadcast sent successfully";
      alert(msg);

      // Reset form
      setMessageText("");
      setSelectedRecipients([]);
      setSelectedTemplateId("");
    } catch (err) {
      console.error("Failed to send SMS:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "❌ Failed to send messages.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-2" />
            <span className="text-blue-700 font-medium">Loading...</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {["send", "templates", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab === "send"
                  ? "Send SMS"
                  : tab === "templates"
                  ? "Message Templates"
                  : "Message History"}
              </button>
            ))}
          </nav>
        </div>

        {/* Send SMS Tab */}
        {activeTab === "send" && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recipients */}
              <div>
                <h2 className="text-lg font-medium mb-4">Select Recipients</h2>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="selectAll"
                        onChange={handleSelectAll}
                        checked={
                          seniorCitizens.length > 0 &&
                          selectedRecipients.length === seniorCitizens.length
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

                    <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 w-full">
                      {/* Search input */}
                      <div className="relative w-full sm:w-1/2">
                        <input
                          type="text"
                          id="search"
                          value={searchText}
                          onChange={(e) => {
                            setSearchText(e.target.value);
                            fetchCitizens(barangayFilter, e.target.value); // Pass search
                          }}
                          placeholder="Search by Name or Contact..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      </div>

                      {/* Barangay filter */}
                      <div className="w-full sm:w-1/2">
                        <select
                          id="barangayFilter"
                          value={barangayFilter}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          onChange={(e) => {
                            const selected = e.target.value;
                            setBarangayFilter(selected);
                            fetchCitizens(selected, searchText); // fetch with search too
                          }}
                        >
                          <option value="">All Barangays</option>
                          {barangays.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.barangay_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {seniorCitizens.length > 0 ? (
                      seniorCitizens.map((citizen) => (
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
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No senior citizens found in this barangay.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Compose Message */}
              <div>
                <h2 className="text-lg font-medium mb-4">Compose Message</h2>
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
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
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
                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      onClick={handleSendMessage}
                      disabled={
                        selectedRecipients.length === 0 ||
                        !messageText ||
                        loading
                      }
                      icon={<SendIcon className="h-4 w-4 mr-2" />}
                    >
                      {loading ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "templates" && <MessageTemplates />}
        {activeTab === "history" && <MessageHistory />}
      </div>
    </div>
  );
};

export default Sms;
