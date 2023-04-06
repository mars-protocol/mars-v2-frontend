import { ENV, VERCEL_BYPASS } from 'constants/env'

/**
 * CONFIG
 */

export enum Endpoints {
  ACCOUNTS = '/wallets/{address}/accounts',
  ACCOUNT_DEBTS = '/accounts/{accountId}/debts',
  MARKETS_BORROW = '/markets/borrow',
  PRICES = '/prices',
  WALLET_BALANCES = '/wallets/{address}/balances',
}

interface ParamProps {
  address?: string
  accountId?: string
}

export function getEndpoint(endpoint: Endpoints, props?: ParamProps) {
  let returnEndpoint: string = endpoint

  returnEndpoint = returnEndpoint.replace('{address}', props?.address || '')
  returnEndpoint = returnEndpoint.replace('{accountId}', props?.accountId || '')

  return returnEndpoint
}

export async function callAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${ENV.URL_API}${endpoint}${VERCEL_BYPASS}`, {
    cache: 'no-store',
  })

  return response.json() as T
}

/**
 * API GETTERS
 */

export async function getAccountDebts(accountId: string) {
  if (!accountId) return []
  return callAPI<Coin[]>(getEndpoint(Endpoints.ACCOUNT_DEBTS, { accountId }))
}

export async function getAccounts(address: string) {
  if (!address) return []
  return callAPI<Account[]>(getEndpoint(Endpoints.ACCOUNTS, { address }))
}

export async function getAccountsSWR(url: string) {
  return callAPI<Account[]>(url)
}

export async function getBorrowData() {
  return callAPI<BorrowAsset[]>(getEndpoint(Endpoints.MARKETS_BORROW))
}

export async function getPrices() {
  return callAPI<Coin[]>(getEndpoint(Endpoints.PRICES))
}

export async function getWalletBalancesSWR(url: string) {
  return callAPI<Coin[]>(url)
}
