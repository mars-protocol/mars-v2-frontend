interface DropDownItem {
  icon: import('react').ReactNode
  onClick: () => void
  text: string
  disabled?: boolean
  disabledTooltip?: string
}
