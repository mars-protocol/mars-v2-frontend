import { ENV, VERCEL_BYPASS } from 'constants/env'

/**
 * CONFIG
 */

export enum Endpoints {
  ACCOUNT_DEBTS = '/accounts/{account}/debts',
  ACCOUNT_POSITIONS = '/wallets/{address}/accounts/positions',
  MARKETS_BORROW = '/markets/borrow',
  PRICES = '/prices',
  WALLET_BALANCES = '/wallets/{address}/balances',
}

interface ParamProps {
  wallet?: string
  account?: string
}

export function getEndpoint(endpoint: Endpoints, props?: ParamProps) {
  endpoint.replace('{address}', props?.wallet || '')
  endpoint.replace('{account}', props?.account || '')

  return endpoint
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

export async function getAccountDebts(account: string) {
  if (!account) return []
  return callAPI<Coin[]>(getEndpoint(Endpoints.ACCOUNT_DEBTS, { account }))
}

export async function getAccountsPositions(wallet: string) {
  if (!wallet) return []
  return callAPI<Coin[]>(getEndpoint(Endpoints.ACCOUNT_POSITIONS, { wallet }))
}

export async function getAccountsPositionsSWR(url: string) {
  return callAPI<Position[]>(url)
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
