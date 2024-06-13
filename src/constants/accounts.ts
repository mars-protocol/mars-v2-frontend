export const EMPTY_ACCOUNT: Account = {
  id: 'default',
  kind: 'default' as AccountKind,
  debts: [],
  deposits: [],
  lends: [],
  vaults: [],
  perps: [],
  perpsVault: null,
  stakedAstroLps: [],
}

export const EMPTY_ACCOUNT_HLS: Account = {
  ...EMPTY_ACCOUNT,
  kind: 'high_levered_strategy' as AccountKind,
}
