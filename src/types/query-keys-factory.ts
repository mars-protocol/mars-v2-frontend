export const queryKeys = {
  allBalances: (address: string) => ['allBalances', address],
  allowedCoins: () => ['allowedCoins'],
  redbankBalances: () => ['redbankBalances'],
  creditAccounts: (address: string) => ['creditAccounts', address],
  creditAccountsPositions: (accountId: string) => ['creditAccountPositions', accountId],
  tokenBalance: (address: string, denom: string) => ['tokenBalance', address, denom],
  tokenPrices: () => ['tokenPrices'],
}
