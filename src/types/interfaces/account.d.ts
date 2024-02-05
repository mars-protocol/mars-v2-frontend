type PositionType = 'deposit' | 'borrow' | 'lend' | 'vault' | 'perp'
type TableType = 'balances' | 'strategies' | 'perps'

interface Account {
  id: string
  deposits: BNCoin[]
  debts: BNCoin[]
  lends: BNCoin[]
  vaults: DepositedVault[]
  perps: PerpPosition[]
  kind: AccountKind
}

interface AccountChange extends Account {
  deposits?: BNCoin[]
  debts?: BNCoin[]
  lends?: BNCoin[]
  vaults?: DepositedVault[]
}

interface AccountBalanceRow {
  amount: BigNumber
  apy: number
  denom: string
  size: number
  symbol: string
  type: PositionType
  value: string
  amountChange: BigNumber
}

interface AccountStrategyRow {
  apy: number
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
