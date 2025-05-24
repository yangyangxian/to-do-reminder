import React from "react";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

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
    <div className={`flex flex-col`}>
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-800">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`h-[35px] bg-[rgb(233,235,240)] text-gray-700 hover:shadow-lg focus:bg-white border-gray-300 rounded-md px-3 py-2 
          text-[14px] focus:outline-[rgb(156,39,176)] focus:outline-2 ${className}`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

interface CustomSelectFieldProps {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (event: SelectChangeEvent<string>) => void;
  className?: string;
  [key: string]: any;
}

export const YSelectField: React.FC<CustomSelectFieldProps> = ({
  label,
  error,
  className,
  options,
  value,
  onChange,
  ...props
}) => {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-800">
          {label}
        </label>
      )}
      <Select
        value={value}
        onChange={onChange}
        color="secondary"
        className={`!w-100 !h-[43px] !text-gray-700 hover:shadow-lg bg-gray-50 !border-gray-300 !rounded-md ${className}`}
        size="small"
        {...props}
        sx={{
          '&.Mui-focused, &:focus': {
            backgroundColor: '#fff',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgb(156,39,176) !important', // secondary color
            },
          },
          '&:hover, &.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d1d5db !important',
          },
          '&.Mui-focused:hover .MuiOutlinedInput-notchedOutline, &:focus:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgb(156,39,176) !important', // keep secondary color on hover+focus
          },
          '& .MuiSelect-select': {
            fontSize: '14px', // Ensures the selected value uses this size
            fontColor: '#364153', // Text color
          },
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};
