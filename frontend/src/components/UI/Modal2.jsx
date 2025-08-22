import React from "react";
import { XIcon } from "lucide-react";

const Modal2 = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center p-4 sm:p-0">
      {/* Overlay with blur effect */}
      <div
        className="fixed inset-0 backdrop-blur-sm" // Added bg-black bg-opacity-30 for better contrast
        aria-hidden="true"
        onClick={onClose} // Optional: Close modal when clicking outside
      ></div>

      <div
        // Adjusted max-w-lg to max-w-4xl to accommodate the larger form
        className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full z-50 max-h-[90vh] overflow-y-auto" // Added max-h and overflow-y-auto
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <h3
              className="text-lg leading-6 font-medium text-gray-900"
              id="modal-headline"
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal2;
