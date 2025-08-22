import React from "react";

const Button = ({
  children,
  variant = "primary",
  icon,
  className = "",
  onClick,
  disabled = false,
  type = "button",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
  const variantClasses = {
    primary:
      "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    danger:
      "border-red-600 bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };
  const disabledClasses = "opacity-50 cursor-not-allowed";
  const classes = `${baseClasses} ${variantClasses[variant]} ${
    disabled ? disabledClasses : ""
  } ${className}`;
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
export default Button;
