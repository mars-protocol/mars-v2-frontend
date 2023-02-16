export default async function getMarkets() {
  const response = await fetch('http://localhost:3000/api/markets', { cache: 'no-store' })

  return response.json()
}
