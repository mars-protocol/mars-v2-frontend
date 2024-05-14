export const defaultFee: StdFee = {
  amount: [
    {
      denom: 'uosmo',
      amount: '500000',
    },
  ],
  gas: '15000000',
}

export const SECONDS_IN_A_YEAR = 31540000
export const DEPOSIT_CAP_BUFFER = 0.999
export const VAULT_DEPOSIT_BUFFER = 0.999
export const SWAP_FEE_BUFFER = 0.005
export const DEFAULT_PORTFOLIO_STATS = [
  { title: null, sub: 'Total Balance' },
  { title: null, sub: 'Total Debt' },
  { title: null, sub: 'Net Worth' },
  { title: null, sub: 'APR' },
  { title: null, sub: 'Account Leverage' },
]

export const ENABLE_AUTO_REPAY = true
export const STANDARD_SWAP_FEE = 0.002
