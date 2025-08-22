import React from "react";
import { SaveIcon, TrashIcon, Loader2 } from "lucide-react";
import Modal from "../UI/Modal";
import Button from "../UI/Button";

const ConfirmationModal = ({
  isOpen,
  type,
  name,
  onClose,
  onConfirm,
  loading,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={type === "delete" ? "Confirm Deletion" : "Confirm Update"}
  >
    <div className="p-6 space-y-4">
      <p className="text-gray-700">
        {type === "delete" ? (
          <>
            Are you sure you want to delete{" "}
            <strong className="text-red-600">{name}</strong>? This cannot be
            undone.
          </>
        ) : (
          <>
            Are you sure you want to update{" "}
            <strong className="text-blue-600">{name}</strong>?
          </>
        )}
      </p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant={type === "delete" ? "danger" : "primary"}
          onClick={onConfirm}
          icon={
            loading ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : type === "delete" ? (
              <TrashIcon className="h-4 w-4 mr-2" />
            ) : (
              <SaveIcon className="h-4 w-4 mr-2" />
            )
          }
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : type === "delete"
            ? "Delete"
            : "Confirm Update"}
        </Button>
      </div>
    </div>
  </Modal>
);

export default ConfirmationModal;
