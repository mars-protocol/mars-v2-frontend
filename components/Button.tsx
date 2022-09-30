import React from 'react'

type Props = {
  children: string
  className?: string
  onClick: () => void
  disabled?: boolean
}

const Button = React.forwardRef<any, Props>(
  ({ children, className = '', onClick, disabled }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={`overflow-hidden text-ellipsis rounded-3xl bg-green-500 py-2 px-5 text-sm font-semibold text-white ${className} ${
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
