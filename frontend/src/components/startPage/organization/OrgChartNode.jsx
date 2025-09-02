import React from "react";

const OrgChartNode = ({ node, isTopNode = false }) => {
  // Check if the current node has children to determine the layout and line connections.
  const hasChildren = node.children && node.children.length > 0;

  // Render the card for a single person in the chart.
  const renderNode = () => (
    <div
      className={`
    relative
    bg-white
    p-4
    rounded-xl
    shadow-lg
    flex
    items-center
    text-left
    border-2
    ${isTopNode ? "border-indigo-600" : "border-gray-200"}
  `}
    >
      {/* Left: Square or Image */}
      <div className="flex-shrink-0 mr-4">
        <div className="bg-gray-200 h-20 w-20 rounded"></div>
      </div>

      {/* Right: Text */}
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800">{node.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{node.title}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      {/* The main person card */}
      {renderNode()}

      {/* Conditionally render the children and connecting lines if children exist */}
      {hasChildren && (
        <div className="relative pt-8">
          {/* Vertical line from the parent node to the children's section */}
          <div className="absolute top-0 left-1/2 w-px h-8 bg-gray-400 transform -translate-x-1/2"></div>

          {/* Container for the children, using flexbox for horizontal layout on larger screens */}
          <div className="flex justify-center items-start w-full relative">
            {/* Horizontal line connecting all children */}
            <div
              className={`
              absolute
              top-0
              w-full
              h-px
              bg-gray-400
            `}
            ></div>

            {/* Recursively render each child node */}
            <div
              className={`
              flex flex-col items-center
              md:flex-row md:justify-center md:items-start
              mt-8
              space-y-8 md:space-y-0 md:space-x-8
            `}
            >
              {node.children.map((childNode, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center relative"
                >
                  {/* Vertical line from the horizontal line to the child node card */}
                  <div className="absolute top-0 left-1/2 w-px h-8 bg-gray-400 transform -translate-x-1/2 -mt-8"></div>
                  <OrgChartNode node={childNode} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default OrgChartNode;
