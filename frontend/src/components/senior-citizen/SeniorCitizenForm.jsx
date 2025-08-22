import React, { useState, useEffect } from "react";
import Button from "../UI/Button"; // Assuming Button is a custom component
import axios from "axios"; // Import Axios

const SeniorCitizenForm = ({
  citizen,
  onSubmitSuccess = () => {}, // default to empty function
  onSubmitError = () => {}, // Add onSubmitError prop
  onCancel = () => {},
}) => {
  const [barangayOptions, setBarangayOptions] = useState([]);

  const isEditing = !!citizen;
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: isEditing ? citizen.firstName : "",
    middleName: isEditing ? citizen.middleName : "",
    lastName: isEditing ? citizen.lastName : "",
    suffix: isEditing ? citizen.suffix : "",
    birthdate: isEditing ? citizen.birthdate.split("T")[0] : "", // Format date for input type="date"
    age: isEditing ? citizen.age : "",
    gender: isEditing ? citizen.gender : "",
    civilStatus: isEditing ? citizen.civilStatus : "",
    religion: isEditing ? citizen.religion : "",
    bloodType: isEditing ? citizen.bloodType : "",

    // Address & Contact Information
    houseNumberStreet: isEditing ? citizen.houseNumberStreet : "",
    barangay: isEditing ? citizen.barangay : "",
    municipality: "San Jose", // Set default for San Jose, Occidental Mindoro
    province: "Occidental Mindoro", // Set default
    zipCode: isEditing ? citizen.zipCode : "",
    mobileNumber: isEditing ? citizen.mobileNumber : "",
    telephoneNumber: isEditing ? citizen.telephoneNumber : "",
    emailAddress: isEditing ? citizen.emailAddress : "",

    // Identification & Membership Details
    validIdType: isEditing ? citizen.validIdType : "",
    validIdNumber: isEditing ? citizen.validIdNumber : "",
    philSysId: isEditing ? citizen.philSysId : "",
    sssNumber: isEditing ? citizen.sssNumber : "",
    gsisNumber: isEditing ? citizen.gsisNumber : "",
    philhealthNumber: isEditing ? citizen.philhealthNumber : "",
    tinNumber: isEditing ? citizen.tinNumber : "",

    // Livelihood & Benefits
    employmentStatus: isEditing ? citizen.employmentStatus : "",
    occupation: isEditing ? citizen.occupation : "",
    highestEducation: isEditing ? citizen.highestEducation : "",
    classification: isEditing ? citizen.classification : "",
    monthlyPension: isEditing ? citizen.monthlyPension : "",

    // Emergency Contact
    emergencyContactName: isEditing ? citizen.emergencyContactName : "",
    emergencyContactRelationship: isEditing
      ? citizen.emergencyContactRelationship
      : "",
    emergencyContactNumber: isEditing ? citizen.emergencyContactNumber : "",

    // Health Information
    healthStatus: isEditing ? citizen.healthStatus : "",
    healthNotes: isEditing ? citizen.healthNotes : "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(""); // State for displaying form-specific errors

  const fetchBarangays = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/barangays/All`);
      const options = res.data.map((b) => b.barangay_name); // or b.name depending on your DB
      setBarangayOptions(options);
    } catch (err) {
      console.error("Failed to fetch barangays:", err);
    }
  };

  useEffect(() => {
    fetchBarangays();
  }, []);

  // Effect to reset form data when `citizen` prop changes (e.g., when opening for add vs. edit)
  useEffect(() => {
    if (isEditing) {
      setFormData({
        firstName: citizen.firstName || "",
        middleName: citizen.middleName || "",
        lastName: citizen.lastName || "",
        suffix: citizen.suffix || "",
        birthdate: citizen.birthdate ? citizen.birthdate.split("T")[0] : "",
        age: citizen.age || "",
        gender: citizen.gender || "",
        civilStatus: citizen.civilStatus || "",
        religion: citizen.religion || "",
        bloodType: citizen.bloodType || "",
        houseNumberStreet: citizen.houseNumberStreet || "",
        barangay: citizen.barangay || "",
        municipality: "San Jose",
        province: "Occidental Mindoro",
        zipCode: citizen.zipCode || "",
        mobileNumber: citizen.mobileNumber || "",
        telephoneNumber: citizen.telephoneNumber || "",
        emailAddress: citizen.emailAddress || "",
        validIdType: citizen.validIdType || "",
        validIdNumber: citizen.validIdNumber || "",
        philSysId: citizen.philSysId || "",
        sssNumber: citizen.sssNumber || "",
        gsisNumber: citizen.gsisNumber || "",
        philhealthNumber: citizen.philhealthNumber || "",
        tinNumber: citizen.tinNumber || "",
        employmentStatus: citizen.employmentStatus || "",
        occupation: citizen.occupation || "",
        highestEducation: citizen.highestEducation || "",
        classification: citizen.classification || "",
        monthlyPension: citizen.monthlyPension || "",
        emergencyContactName: citizen.emergencyContactName || "",
        emergencyContactRelationship:
          citizen.emergencyContactRelationship || "",
        emergencyContactNumber: citizen.emergencyContactNumber || "",
        healthStatus: citizen.healthStatus || "",
        healthNotes: citizen.healthNotes || "",
      });
    } else {
      // Reset to initial empty state for adding
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        birthdate: "",
        age: "",
        gender: "",
        civilStatus: "",
        religion: "",
        bloodType: "",
        houseNumberStreet: "",
        barangay: "",
        municipality: "San Jose",
        province: "Occidental Mindoro",
        zipCode: "",
        mobileNumber: "",
        telephoneNumber: "",
        emailAddress: "",
        validIdType: "",
        validIdNumber: "",
        philSysId: "",
        sssNumber: "",
        gsisNumber: "",
        philhealthNumber: "",
        tinNumber: "",
        employmentStatus: "",
        occupation: "",
        highestEducation: "",
        classification: "",
        monthlyPension: "",
        emergencyContactName: "",
        emergencyContactRelationship: "",
        emergencyContactNumber: "",
        healthStatus: "",
        healthNotes: "",
      });
    }
    setFormError(""); // Clear any previous errors when the form is re-initialized
  }, [citizen, isEditing]);

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === "birthdate") {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      setFormData((prev) => ({
        ...prev,
        birthdate: value,
        age: age >= 0 ? age : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(""); // Clear previous errors on new submission attempt

    try {
      let response;
      if (isEditing) {
        response = await axios.put(
          `${backendUrl}/api/senior-citizens/update/${citizen.id}`,
          formData,
          { withCredentials: true }
        );
        onSubmitSuccess("Senior citizen record updated successfully!");
      } else {
        response = await axios.post(
          `${backendUrl}/api/senior-citizens/create`,
          formData,
          { withCredentials: true }
        );
        onSubmitSuccess("New senior citizen registered successfully!");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      let errorMessage = "Failed to save record. Please try again.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setFormError(errorMessage); // Set form-specific error
      onSubmitError(errorMessage); // Pass error message to parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common input styles for reusability
  const inputStyle =
    "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="bg-white rounded-lg shadow-md max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {isEditing
          ? "Edit Senior Citizen Record"
          : "Senior Citizen Registration Form"}
      </h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* --- Personal Information --- */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="firstName" className={labelStyle}>
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label htmlFor="middleName" className={labelStyle}>
                Middle Name
              </label>
              <input
                type="text"
                id="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelStyle}>
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label htmlFor="suffix" className={labelStyle}>
                Suffix (e.g., Jr., Sr.)
              </label>
              <input
                type="text"
                id="suffix"
                value={formData.suffix}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label htmlFor="birthdate" className={labelStyle}>
                Birth Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label htmlFor="age" className={labelStyle}>
                Age
              </label>
              <input
                type="number"
                id="age"
                value={formData.age}
                readOnly
                className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
              />
            </div>
            <div>
              <label htmlFor="gender" className={labelStyle}>
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label htmlFor="civilStatus" className={labelStyle}>
                Civil Status <span className="text-red-500">*</span>
              </label>
              <select
                id="civilStatus"
                value={formData.civilStatus}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option value="">Select status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
                <option value="Separated">Separated</option>
              </select>
            </div>
            <div>
              <label htmlFor="religion" className={labelStyle}>
                Religion
              </label>
              <input
                type="text"
                id="religion"
                value={formData.religion}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="bloodType" className={labelStyle}>
                Blood Type
              </label>
              <select
                id="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- Address and Contact Information --- */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Address & Contact Information
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="houseNumberStreet" className={labelStyle}>
                House No. / Street / Purok / Sitio{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="houseNumberStreet"
                value={formData.houseNumberStreet}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label htmlFor="barangay" className={labelStyle}>
                Barangay <span className="text-red-500">*</span>
              </label>
              <select
                id="barangay"
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option value="">Select barangay</option>
                {barangayOptions.map((barangay, index) => (
                  <option key={index} value={barangay}>
                    {barangay}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="municipality" className={labelStyle}>
                City/Municipality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="municipality"
                value={formData.municipality}
                readOnly
                className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
              />
            </div>
            <div>
              <label htmlFor="province" className={labelStyle}>
                Province <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="province"
                value={formData.province}
                readOnly
                className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label htmlFor="zipCode" className={labelStyle}>
                Zip Code
              </label>
              <input
                type="text"
                id="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="mobileNumber" className={labelStyle}>
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label htmlFor="telephoneNumber" className={labelStyle}>
                Telephone Number
              </label>
              <input
                type="tel"
                id="telephoneNumber"
                value={formData.telephoneNumber}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="emailAddress" className={labelStyle}>
                Email Address
              </label>
              <input
                type="email"
                id="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* --- Identification & Membership Details --- */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Identification & Membership Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="validIdType" className={labelStyle}>
                Type of Valid ID Presented{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                id="validIdType"
                value={formData.validIdType}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option value="">Select ID Type</option>
                <option value="Passport">Passport</option>
                <option value="UMID">UMID (SSS/GSIS ID)</option>
                <option value="Driver's License">Driver's License</option>
                <option value="Voter's ID">Voter's ID</option>
                <option value="Postal ID">Postal ID</option>
                <option value="PRC ID">PRC ID</option>
                <option value="Birth Certificate">
                  Birth Certificate (Supporting)
                </option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="validIdNumber" className={labelStyle}>
                Valid ID Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="validIdNumber"
                value={formData.validIdNumber}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="philSysId" className={labelStyle}>
                PhilSys ID (National ID)
              </label>
              <input
                type="text"
                id="philSysId"
                value={formData.philSysId}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="sssNumber" className={labelStyle}>
                SSS Number
              </label>
              <input
                type="text"
                id="sssNumber"
                value={formData.sssNumber}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="gsisNumber" className={labelStyle}>
                GSIS Number
              </label>
              <input
                type="text"
                id="gsisNumber"
                value={formData.gsisNumber}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="philhealthNumber" className={labelStyle}>
                PhilHealth Number
              </label>
              <input
                type="text"
                id="philhealthNumber"
                value={formData.philhealthNumber}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="tinNumber" className={labelStyle}>
                TIN Number
              </label>
              <input
                type="text"
                id="tinNumber"
                value={formData.tinNumber}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* --- Livelihood & Benefits --- */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Livelihood & Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="employmentStatus" className={labelStyle}>
                Employment Status
              </label>
              <select
                id="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="">Select status</option>
                <option value="Employed">Employed</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
            <div>
              <label htmlFor="occupation" className={labelStyle}>
                Occupation (if applicable)
              </label>
              <input
                type="text"
                id="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="highestEducation" className={labelStyle}>
                Highest Educational Attainment
              </label>
              <select
                id="highestEducation"
                value={formData.highestEducation}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="">Select attainment</option>
                <option value="No Formal Education">No Formal Education</option>
                <option value="Elementary Level">Elementary Level</option>
                <option value="Elementary Graduate">Elementary Graduate</option>
                <option value="High School Level">High School Level</option>
                <option value="High School Graduate">
                  High School Graduate
                </option>
                <option value="Vocational">Vocational</option>
                <option value="College Level">College Level</option>
                <option value="College Graduate">College Graduate</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Doctoral Degree">Doctoral Degree</option>
              </select>
            </div>
            <div>
              <label htmlFor="classification" className={labelStyle}>
                Classification <span className="text-red-500">*</span>
              </label>
              <select
                id="classification"
                value={formData.classification}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option value="">Select classification</option>
                <option value="Indigent">Indigent</option>
                <option value="Pensioner">Pensioner</option>
                <option value="With Family Support">With Family Support</option>
                <option value="Working Senior">Working Senior</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="monthlyPension" className={labelStyle}>
              Monthly Pension (if applicable)
            </label>
            <input
              type="number"
              id="monthlyPension"
              value={formData.monthlyPension}
              onChange={handleChange}
              className={inputStyle}
              placeholder="e.g., 5000"
            />
          </div>
        </div>

        {/* --- Emergency Contact Information --- */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Emergency Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="emergencyContactName" className={labelStyle}>
                Name of Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label
                htmlFor="emergencyContactRelationship"
                className={labelStyle}
              >
                Relationship to Senior Citizen{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label htmlFor="emergencyContactNumber" className={labelStyle}>
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="emergencyContactNumber"
                value={formData.emergencyContactNumber}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
          </div>
        </div>

        {/* --- Health Information --- */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Health Information
          </h3>
          <div>
            <label htmlFor="healthStatus" className={labelStyle}>
              Overall Health Status
            </label>
            <select
              id="healthStatus"
              value={formData.healthStatus}
              onChange={handleChange}
              className={inputStyle}
            >
              <option value="">Select health status</option>
              <option value="Good">Good</option>
              <option value="With Maintenance Meds">
                With Maintenance Meds
              </option>
              <option value="Needs Medical Attention">
                Needs Medical Attention
              </option>
              <option value="Bedridden">Bedridden</option>
            </select>
          </div>

          <div className="mt-4">
            <label htmlFor="healthNotes" className={labelStyle}>
              Health Notes / Existing Conditions
            </label>
            <textarea
              id="healthNotes"
              rows={3}
              value={formData.healthNotes}
              onChange={handleChange}
              className={inputStyle}
              placeholder="e.g., Diabetes, Hypertension, Allergies to..."
            />
          </div>
        </div>

        {/* Display form-specific error */}
        {formError && (
          <div className="text-red-600 text-sm text-center mt-4">
            {formError}
          </div>
        )}

        {/* --- Form Actions --- */}
        <div className="flex justify-end space-x-3 pt-6">
          <Button
            variant="secondary"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update" : "Register"}{" "}
            Senior Citizen
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SeniorCitizenForm;
