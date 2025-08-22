import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Modal, Slider, Button as MuiButton } from "@mui/material";
import getCroppedImg from "../../utils/cropImageHelper";

const CropperModal = ({
  imageSrc,
  onClose,
  onCropComplete,
  aspect = 1,
  cropShape = "rect",
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async () => {
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        cropShape
      ); // Add cropShape arg
      const previewUrl = URL.createObjectURL(croppedImage); // Generate preview
      onCropComplete(croppedImage, previewUrl); // Pass both blob and preview
    } catch (e) {
      console.error("Cropping failed:", e);
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <div className="fixed inset-0 bg-opacity-60 flex justify-center items-center">
        <div className="bg-white p-4 rounded-md shadow-lg w-[90vw] max-w-lg">
          <div className="relative w-full h-96 bg-gray-200">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={cropShape}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>
          <div className="mt-4">
            <label>Zoom</label>
            <Slider
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e, z) => setZoom(z)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <MuiButton onClick={onClose} variant="outlined">
                Cancel
              </MuiButton>
              <MuiButton
                onClick={handleDone}
                variant="contained"
                color="primary"
              >
                Crop & Save
              </MuiButton>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CropperModal;
