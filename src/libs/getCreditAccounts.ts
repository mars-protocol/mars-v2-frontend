export default async function getCreditAccounts(address: string): Promise<string[]> {
  const response = await fetch(`http://localhost:3000/api/wallets/${address}/accounts`, {
    cache: 'no-store',
  })

  return response.json()
}
