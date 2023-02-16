import { ArrayOfVaultInfoResponse } from 'types/generated/mars-mock-credit-manager/MarsMockCreditManager.types'

export default async function getVaultsInfo(): Promise<ArrayOfVaultInfoResponse> {
  const response = await fetch('http://localhost:3000/api/vaults', { cache: 'no-store' })

  async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time))
  }

  await sleep(3000)

  return response.json()
}
