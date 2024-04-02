type PositionType = 'deposit' | 'borrow' | 'lend' | 'vault' | 'perp'
type TableType = 'balances' | 'strategies' | 'perps'
type AccountKind = 'high_levered_strategy' | 'default'

interface Account {
  id: string
  deposits: BNCoin[]
  debts: BNCoin[]
  lends: BNCoin[]
  vaults: DepositedVault[]
  perps: PerpsPosition[]
  perpVault: PerpVaultPositions | null
  kind: AccountKind
}

interface AccountChange extends Account {
  deposits?: BNCoin[]
  debts?: BNCoin[]
  lends?: BNCoin[]
  vaults?: DepositedVault[]
  perps?: PerpsPosition[]
  perpVault?: PerpVaultPositions
}

interface AccountBalanceRow {
  amount: BigNumber
  apy?: number | null
  denom: string
  size: number
  symbol: string
  type: PositionType
  value: string
  amountChange: BigNumber
}

interface AccountStrategyRow {
  apy?: number | null
  name: string
  denom: string
  amount: BNCoin[]
  value: string
  amountChange: BNCoin[]
}

interface AccountPerpRow extends PerpsPosition {
  amount: BigNumber
  symbol: string
  value: string
  amountChange: BigNumber
}

interface AccountIdAndKind {
  id: string
  kind: AccountKind
}

interface HLSAccountWithStrategy extends Account {
  leverage: number
  strategy: HLSStrategy
  values: {
    net: BigNumber
    debt: BigNumber
    total: BigNumber
  }
}

interface PerpVaultPositions {
  active: {
    amount: BigNumber
    shares: BigNumber
  } | null
  denom: string
  unlocked: BigNumber | null
  unlocking: PerpVaultUnlockingPosition[]
}

interface PerpVaultUnlockingPosition {
  amount: BigNumber
  unlocksAt: number
}
