import Button from "../Button";

const Update = ({
  selectedCitizen,
  setShowUpdateModal,
  handleUpdateConfirm,
}) => {
  return (
    <div className="p-6">
      <p className="mb-4 text-gray-700">
        Are you sure you want to update{" "}
        <span className="font-semibold text-blue-600">
          {selectedCitizen
            ? `${selectedCitizen.firstName} ${selectedCitizen.lastName}` ||
              `${selectedCitizen.name}`
            : "this citizen"}
        </span>
        's information?
      </p>
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleUpdateConfirm}>
          Delete
        </Button>
      </div>
    </div>
  );
};
export default Update;
