export default async function getCreditAccounts() {
  const response = await fetch(
    'http://localhost:3000/api/credit-accounts?wallet=osmo1d2e4vvdrxwnd5r0ctdq2u8nzy2qx9fufuvf0l5',
    {
      next: { revalidate: 10 },
    },
  ).then((r) => {
    console.log('fetching')
    return r
  })

  console.log(response.headers)
  return response.json()
}
