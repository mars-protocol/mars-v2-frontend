import { ENV } from 'constants/env'

export default async function getWalletBalances(address: string): Promise<Coin[]> {
  const uri = '/cosmos/bank/v1beta1/balances/'

  const response = await fetch(`${ENV.URL_REST}${uri}${address}`)

  if (response.ok) {
    const data = await response.json()
    return data.balances
  }

  return new Promise((_, reject) => reject('No data'))
}
