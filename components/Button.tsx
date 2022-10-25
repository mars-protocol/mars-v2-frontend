import React from 'react'

type Props = {
  children: string
  className?: string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
}

const Button = React.forwardRef<any, Props>(
  ({ children, className = '', onClick, disabled }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={`overflow-hidden text-ellipsis rounded-md bg-blue-500 py-2 px-5 text-sm font-semibold text-white ${className} ${
        disabled ? 'opacity-40' : ''
      }`}
      disabled={disabled}
    >
      {children}
    </button>
  )
)

Button.displayName = 'Button'
export default Button
