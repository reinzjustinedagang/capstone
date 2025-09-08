import Button from "../Button";

const Delete = ({
  selectedCitizen,
  setShowDeleteModal,
  handleDeleteConfirm,
  deleting,
}) => {
  return (
    <div className="p-6 text-center">
      <p className="mb-4">
        Are you sure you want to delete{" "}
        <span className="font-semibold">
          {selectedCitizen?.firstName} {selectedCitizen?.lastName}
        </span>
        ?
      </p>
      <div className="flex justify-end space-x-4">
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDeleteConfirm}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
};

export default Delete;
