import { Coin } from '@cosmjs/stargate'
import { URL_API } from 'constants/env'
import { BorrowData } from 'pages/api/markets/borrow'

export async function callAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${URL_API}${endpoint}`, {
    cache: 'no-store',
  })

  return response.json() as T
}

export async function getBorrowData() {
  return callAPI<BorrowData[]>('/markets/borrow')
}

export async function getCreditAccounts(address: string) {
  return callAPI<any[]>(`/wallets/${address}/accounts`)
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
  return callAPI<Coin[]>(`/accounts/${account}/debts`)
}

export async function getAccountDeposits(account: string) {
  return callAPI<Coin[]>(`/accounts/${account}/deposits`)
}
export async function getWalletBalances(wallet: string) {
  return callAPI<Coin[]>(`/wallets/${wallet}/balances`)
}
