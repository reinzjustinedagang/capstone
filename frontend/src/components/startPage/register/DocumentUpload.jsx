import React from "react";

const DocumentUpload = () => {
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
  return (
    <div>
      {/* Document Upload Section */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-xl font-semibold leading-7 text-gray-900">
          Document Upload
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Upload one valid document and your 1x1 photo.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label
              htmlFor="document-type"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Type of Document
            </label>
            <select
              id="document-type"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">-- Select a document --</option>
              {documentTypes.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="document-upload"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Upload Document
            </label>
            <input
              type="file"
              id="document-upload"
              required
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="sm:col-span-3">
            <label
              htmlFor="photo-upload"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Upload 1x1 Photo
            </label>
            <input
              type="file"
              id="photo-upload"
              required
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must have a white background.
            </p>
          </div>
        </div>
      </div>

      {/* Agreement and Submission */}
      <div className="mt-6 space-y-6">
        <div className="relative flex gap-x-3">
          <div className="flex h-6 items-center">
            <input
              id="agreement"
              name="agreement"
              type="checkbox"
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
      </div>

      <div className="mt-10 flex items-center justify-end gap-x-6">
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
        >
          Submit Application
        </button>
      </div>
    </div>
  );
};

export default DocumentUpload;
