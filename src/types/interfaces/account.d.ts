type PositionType = 'deposit' | 'borrow' | 'lend' | 'vault' | 'perp'
type TableType = 'balances' | 'strategies' | 'perps'
type AccountKind = import('types/generated/mars-credit-manager/MarsCreditManager.types').AccountKind

interface Account {
  id: string
  deposits: BNCoin[]
  debts: BNCoin[]
  lends: BNCoin[]
  vaults: DepositedVault[]
  perps: PerpsPosition[]
  perpsVault: PerpsVaultPositions | null
  kind: AccountKind
}

interface AccountChange extends Account {
  deposits?: BNCoin[]
  debts?: BNCoin[]
  lends?: BNCoin[]
  vaults?: DepositedVault[]
  perps?: PerpsPosition[]
  perpsVault?: PerpsVaultPositions
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
  value: string
  coins: {
    primary: BNCoin
    secondary?: BNCoin
  }
  coinsChange: {
    primary: BNCoin
    secondary?: BNCoin
  }
  unlocksAt?: number
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

interface PerpsVaultPositions {
  active: {
    amount: BigNumber
    shares: BigNumber
  } | null
  denom: string
  unlocked: BigNumber | null
  unlocking: PerpsVaultUnlockingPosition[]
}

interface PerpsVaultUnlockingPosition {
  amount: BigNumber
  unlocksAt: number
}
