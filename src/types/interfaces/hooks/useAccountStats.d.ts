interface AccountStatsAction {
  type: 'borrow' | 'repay' | 'deposit' | 'withdraw'
  amount: number
  denom: string
}
