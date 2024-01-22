type AccountType = 'deposits' | 'borrowing' | 'lending' | 'vault' | 'perp'

interface Account extends AccountChange {
  id: string
  deposits: import('types/classes/BNCoin').BNCoin[]
  debts: import('types/classes/BNCoin').BNCoin[]
  lends: import('types/classes/BNCoin').BNCoin[]
  vaults: DepositedVault[]
  perps: PerpPosition[]
  kind: AccountKind
}

interface AccountChange {
  deposits?: import('types/classes/BNCoin').BNCoin[]
  debts?: import('types/classes/BNCoin').BNCoin[]
  lends?: import('types/classes/BNCoin').BNCoin[]
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
  pnl: import('types/classes/BNCoin').BNCoin
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
