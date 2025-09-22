import React from "react";

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`text-body-sb w-full h-15 bg-gradient-to-br from-[#7C3BC6] to-[#360862] text-white rounded-[12px] disabled:opacity-50 disabled:cursor-not-allowed ${
        className || ""
      }`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
