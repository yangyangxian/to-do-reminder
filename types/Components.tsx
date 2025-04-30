import React from "react";

interface CustomTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Optional label for the text field
  error?: string; // Optional error message
}

export const YTextField: React.FC<CustomTextFieldProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`h-[35px] w-40 border bg-gray-200 border-gray-300 rounded-md px-3 py-2 
          text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 `}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};
