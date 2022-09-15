import React from "react";

type Props = {
  children: string;
  className?: string;
  onClick: () => void;
};

const Button = React.forwardRef<any, Props>(
  ({ children, className = "", onClick }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={`rounded-3xl bg-green-500 py-2 px-5 text-white text-sm font-semibold overflow-hidden text-ellipsis ${className}`}
    >
      {children}
    </button>
  )
);

Button.displayName = "Button";
export default Button;
