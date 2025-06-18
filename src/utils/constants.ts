export const defaultFee = (chainConfig: ChainConfig) => {
  return {
    amount: [
      {
        denom: chainConfig.isOsmosis ? 'uosmo' : 'ntrn',
        amount: chainConfig.isOsmosis ? '90000' : '70000',
      },
    ],
    gas: '15000000',
  } as StdFee
}

export const SECONDS_IN_A_YEAR = 31540000
export const DEPOSIT_CAP_BUFFER = 0.999
export const SWAP_FEE_BUFFER = 0.005
export const DEFAULT_PORTFOLIO_STATS = [
  { title: null, sub: 'Total Balance' },
  { title: null, sub: 'Collateral Power' },
  { title: null, sub: 'Total Debt' },
  { title: null, sub: 'Net Worth' },
  { title: null, sub: 'APY' },
  { title: null, sub: 'Account Leverage' },
]

export const ENABLE_AUTO_REPAY = true
export const STANDARD_SWAP_FEE = 0.002
export const HF_THRESHOLD = 1.03
export const MINIMUM_USDC = 1000000

export const MARS_DECIMALS = 6
export const MARS_DENOM = 'factory/neutron1ndu2wvkrxtane8se2tr48gv7nsm46y5gcqjhux/MARS'
