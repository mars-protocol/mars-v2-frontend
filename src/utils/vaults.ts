import { IS_TESTNET } from 'constants/env'
import { TESTNET_VAULTS, VAULTS } from 'constants/vaults'

export function getVaultMetaData(address: string) {
  const vaults = IS_TESTNET ? TESTNET_VAULTS : VAULTS
  return vaults.find((vault) => vault.address === address)
}
