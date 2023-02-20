export const queryKeys = {
  allBalances: (address: string) => ['allBalances', address],
  allowedCoins: () => ['allowedCoins'],
  estimateFee: () => ['estimateFee'],
  creditAccounts: (address: string) => ['creditAccounts', address],
  creditAccountsPositions: (accountId: string) => ['creditAccountPositions', accountId],
  redbankBalances: () => ['redbankBalances'],
  tokenBalance: (address: string, denom: string) => ['tokenBalance', address, denom],
  tokenPrices: () => ['tokenPrices'],
}
