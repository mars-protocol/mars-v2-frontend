export type AvailableOrderType = 'Market' | 'Limit' | 'Stop'
export interface OrderTab {
  type: AvailableOrderType
  isDisabled: boolean
  tooltipText: string
}
