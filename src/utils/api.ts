import { NETWORK } from 'types/enums'

export const getManagedVaultsUrl = (vaultAddress?: string) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_NETWORK === NETWORK.MAINNET
      ? 'https://backend.prod.mars-dev.net'
      : 'https://backend.test.mars-dev.net'

  const url = `${baseUrl}/v2/managed_vaults?chain=neutron`
  return vaultAddress ? `${url}&address=${vaultAddress}` : url
}
