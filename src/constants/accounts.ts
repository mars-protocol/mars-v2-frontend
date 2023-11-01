export const EMPTY_ACCOUNT: Account = {
  id: '',
  kind: 'default',
  debts: [],
  deposits: [],
  lends: [],
  vaults: [],
}

export const EMPTY_ACCOUNT_HLS: Account = {
  ...EMPTY_ACCOUNT,
  kind: 'high_levered_strategy',
}
