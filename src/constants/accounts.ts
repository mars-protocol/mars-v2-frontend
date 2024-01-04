export const EMPTY_ACCOUNT: Account = {
  id: 'default',
  kind: 'default',
  debts: [],
  deposits: [],
  lends: [],
  vaults: [],
  perps: [],
}

export const EMPTY_ACCOUNT_HLS: Account = {
  ...EMPTY_ACCOUNT,
  kind: 'high_levered_strategy',
}
