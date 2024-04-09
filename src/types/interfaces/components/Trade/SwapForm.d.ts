type AvailableOrderType = 'Market' | 'Limit' | 'Stop'
interface OrderTab {
  type: AvailableOrderType
  isDisabled: boolean
  tooltipText?: string
}
