import React from "react";

const DocumentUpload = ({ formData, setFormData }) => {
  const documentTypes = [
    "Certificate of Live Birth",
    "Social Security System (SSS) ID",
    "Government Service Insurance System (GSIS) ID",
    "Driver's License",
    "Philippine Passport",
    "COMELEC ID / Voter's Certification",
    "Baptismal Certificate",
    "Marriage Certificate",
    "Unified Multi-Purpose ID (UMID)",
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] })); // store file
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <>
      <div className="bg-gray-50 rounded-md border border-gray-200">
        <div className="cursor-pointer flex justify-between items-center p-4 bg-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              Document Upload
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Upload one valid document and your 1x1 photo.
            </p>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type of Document <span className="text-red-600">*</span>
            </label>
            <select
              name="documentType"
              value={formData.documentType || ""}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 
                     focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">-- Select a document --</option>
              {documentTypes.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Document <span className="text-red-600">*</span>
            </label>
            <input
              type="file"
              name="documentFile"
              onChange={handleChange}
              required
              className="mt-1 block w-full text-sm text-gray-500 
                     file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                     file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
                     hover:file:bg-blue-100"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload 1x1 Photo <span className="text-red-600">*</span>
            </label>
            <input
              type="file"
              name="photoFile"
              accept="image/*"
              onChange={handleChange}
              required
              className="mt-1 block w-full text-sm text-gray-500 
                     file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                     file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
                     hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must have a white background.
            </p>
          </div>
        </div>

        {/* Agreement */}
      </div>
      <div className="mx-4 md:mx-0 relative flex gap-x-3 ">
        <div className="flex h-6 items-center">
          <input
            id="agreement"
            name="agreement"
            type="checkbox"
            checked={formData.agreement || false}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                agreement: e.target.checked,
              }))
            }
            required
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
        </div>
        <div className="text-sm leading-6">
          <label htmlFor="agreement" className="font-medium text-gray-900">
            I hereby certify that the information provided is true and correct
            to the best of my knowledge.
          </label>
        </div>
      </div>
    </>
  );
};

export default DocumentUpload;
