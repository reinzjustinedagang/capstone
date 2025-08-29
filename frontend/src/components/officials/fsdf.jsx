const OrgChartNode = ({ node, isTopNode = false, onEdit, onDelete }) => {
  const hasChildren = node.children && node.children.length > 0;

  const renderNode = () => (
    <div
      className={`relative bg-white p-4 rounded-xl shadow-lg min-w-[150px] flex flex-col items-center text-center border-2 ${
        isTopNode ? "border-indigo-600" : "border-gray-200"
      }`}
    >
      <h3 className="text-lg font-semibold text-gray-800">{node.name}</h3>
      <p className="text-sm text-gray-500 mt-1">{node.title}</p>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onEdit(node)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(node)}
          className="text-red-600 hover:text-red-800"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      {renderNode()}

      {hasChildren && (
        <div className="relative pt-8">
          {/* vertical line */}
          <div className="absolute top-0 left-1/2 w-px h-8 bg-gray-400 transform -translate-x-1/2"></div>

          <div className="flex justify-center items-start w-full relative">
            {/* horizontal line */}
            <div className="absolute top-0 w-full h-px bg-gray-400"></div>

            <div
              className="flex flex-col items-center md:flex-row md:justify-center md:items-start mt-8
                space-y-8 md:space-y-0 md:space-x-8"
            >
              {node.children.map((childNode, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center relative"
                >
                  <div className="absolute top-0 left-1/2 w-px h-8 bg-gray-400 transform -translate-x-1/2 -mt-8"></div>
                  <OrgChartNode
                    node={childNode}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
