export default async function getAllowedCoins(): Promise<string[]> {
  const response = await fetch(`http://localhost:3000/api/allowed-coins`, {
    cache: 'no-store',
  })

  return response.json()
}
