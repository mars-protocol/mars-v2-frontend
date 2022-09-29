export const queryKeys = {
  allBalances: (address: string) => ['allBalances', address],
  allowedCoins: () => ['allowedCoins'],
  creditAccounts: (address: string) => ['creditAccounts', address],
  creditAccountsPositions: (accountId: string) => ['creditAccountPositions', accountId],
  tokenBalance: (address: string, denom: string) => ['tokenBalance', address, denom],
}
