import { VAULTS } from 'constants/vaults'

export function getVaultMetaData(address: string) {
  return VAULTS.find((vault) => vault.address === address)
}
