import Button from "../Button";

const Delete = ({
  selectedCitizen,
  setShowDeleteModal,
  handleDeleteConfirm,
}) => {
  return (
    <div className="p-6">
      <p className="mb-4 text-gray-700">
        Are you sure you want to delete the record for{" "}
        <span className="font-semibold text-red-600">
          {selectedCitizen
            ? `${selectedCitizen.firstName} ${selectedCitizen.lastName}` ||
              `${selectedCitizen.name}`
            : "this citizen"}
        </span>
        ? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDeleteConfirm}>
          Delete
        </Button>
      </div>
    </div>
  );
};
export default Delete;
