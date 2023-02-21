import { Coin } from '@cosmjs/stargate'

export default async function getUserBalances(address: string): Promise<Coin[]> {
  const response = await fetch(`http://localhost:3000/api/wallets/${address}/balances`, {
    cache: 'no-store',
  })

  return response.json()
}
