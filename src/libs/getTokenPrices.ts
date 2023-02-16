export default async function getTokenPrices() {
  const response = await fetch('http://localhost:3000/api/token-prices', { cache: 'no-store' })

  return response.json()
}
