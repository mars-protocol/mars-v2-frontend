type AccountType = 'deposits' | 'borrowing' | 'lending' | 'vault' | 'perp'

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
  type: AccountType
  value: string
  amountChange: BigNumber
}

interface AccountPerpRow {
  size: BigNumber
  denom: string
  symbol: string
  value: string
  sizeChange: BigNumber
  pnl: BNCoin
  tradeDirection: TradeDirection
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
