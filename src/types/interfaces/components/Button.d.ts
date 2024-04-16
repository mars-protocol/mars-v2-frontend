interface ButtonProps {
  autoFocus?: boolean
  children?: string | ReactNode
  className?: string
  color?: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
  disabled?: boolean
  id?: string
  showProgressIndicator?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  text?: string | ReactNode
  variant?: 'solid' | 'transparent' | 'round' | 'rounded'
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  onMouseOver?: (e: React.MouseEvent<HTMLButtonElement>) => void
  leftIcon?: ReactElement
  rightIcon?: ReactElement
  iconClassName?: string
  hasSubmenu?: boolean
  hasFocus?: boolean
  dataTestId?: string
  tabIndex?: number
  textClassNames?: string
}
