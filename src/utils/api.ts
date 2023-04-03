import { Coin } from '@cosmjs/stargate'

import { ENV, VERCEL_BYPASS } from 'constants/env'

export async function callAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${ENV.URL_API}${endpoint}${VERCEL_BYPASS}`, {
    cache: 'no-store',
  })

  return response.json() as T
}

export async function getBorrowData() {
  return callAPI<BorrowAsset[]>('/markets/borrow')
}

export async function getCreditAccounts(address: string) {
  if (!address) return []
  return callAPI<string[]>(`/wallets/${address}/accounts`)
}

export async function getMarkets() {
  return callAPI<Market[]>(`/markets`)
}

export async function getPrices() {
  return callAPI<Coin[]>(`/prices`)
}

export async function getVaults() {
  return callAPI<any[]>(`/vaults`)
}

export async function getAccountDebts(account: string) {
  if (!account) return []
  return callAPI<Coin[]>(`/accounts/${account}/debts`)
}

export async function getAccountDeposits(account: string) {
  if (!account) return []
  return callAPI<Coin[]>(`/accounts/${account}/deposits`)
}

export async function getWalletBalances(props: { key: string; wallet: string }) {
  if (!props.wallet) return []
  return callAPI<Coin[]>(`/wallets/${props.wallet}/balances`)
}

export async function getAccountsPositions(props: { key: string; wallet: string }) {
  if (!props.wallet) return []
  return callAPI<Position[]>(`/wallets/${props.wallet}/accounts/positions`)
}
