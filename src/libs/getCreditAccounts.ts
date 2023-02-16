export default async function getCreditAccounts(): Promise<string[]> {
  const response = await fetch(
    'http://localhost:3000/api/credit-accounts/osmo1d2e4vvdrxwnd5r0ctdq2u8nzy2qx9fufuvf0l5',
    { cache: 'no-store' },
  )

  async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time))
  }

  await sleep(1000)

  return response.json()
}
