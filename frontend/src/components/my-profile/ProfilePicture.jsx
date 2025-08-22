import React, { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import user from "../../assets/user.png";
import CropperModal from "../UI/CropperModal"; // Make sure this exists

const ProfilePicture = ({ profilePicture, onCropReady }) => {
  const fileInputRef = useRef(null);
  const [tempImageUrl, setTempImageUrl] = useState(null); // For preview
  const [showCropper, setShowCropper] = useState(false);
  const [rawImage, setRawImage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result); // base64
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBlob, croppedPreview) => {
    setTempImageUrl(croppedPreview);
    onCropReady?.(croppedBlob); // Pass blob to parent
    setShowCropper(false);
  };

  return (
    <div className="relative group w-30 h-30 my-auto">
      <img
        src={tempImageUrl || profilePicture || user}
        alt="Profile"
        className="w-full h-full rounded-full object-cover border-4 border-blue-200 group-hover:border-blue-400 transition-all duration-300 shadow"
      />

      <label
        htmlFor="profile-picture-upload"
        className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 cursor-pointer
             opacity-100 lg:opacity-0 lg:group-hover:opacity-100
             transition-all duration-300 transform lg:translate-y-1 lg:group-hover:translate-y-0
             shadow-lg hover:bg-blue-700"
        title="Change profile picture"
      >
        <ImagePlus className="h-4 w-4" />
        <input
          id="profile-picture-upload"
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </label>

      {showCropper && rawImage && (
        <CropperModal
          imageSrc={rawImage}
          onClose={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
          cropShape="round" // custom prop we'll pass to CropperModal
        />
      )}
    </div>
  );
};

export default ProfilePicture;
