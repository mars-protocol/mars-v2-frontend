import React from "react";

type Props = {
  children: string;
  className?: string;
  onClick: () => void;
  disabled?: boolean;
};

const Button = React.forwardRef<any, Props>(
  ({ children, className = "", onClick, disabled }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={`rounded-3xl bg-green-500 py-2 px-5 text-white text-sm font-semibold overflow-hidden text-ellipsis ${className} ${
        disabled ? "opacity-40" : ""
      }`}
      disabled={disabled}
    >
      {children}
    </button>
  )
);

Button.displayName = "Button";
export default Button;
