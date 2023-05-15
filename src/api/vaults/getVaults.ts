import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'
import { convertAprToApy } from 'utils/parsers'
import getVaultConfigs from 'api/vaults/getVaultConfigs'
import getAprs from 'api/vaults/getVaultAprs'

export default async function getVaults(): Promise<Vault[]> {
  if (!ENV.URL_RPC || !ENV.ADDRESS_CREDIT_MANAGER) {
    return new Promise((_, reject) => reject(ENV_MISSING_MESSAGE))
  }

  const $vaultConfigs = getVaultConfigs()
  const $aprs = getAprs()
  const vaults: Vault[] = await Promise.all([$vaultConfigs, $aprs]).then(([vaultConfigs, aprs]) => {
    return vaultConfigs.map((vaultConfig) => {
      const apr = aprs.find((apr) => apr.address === vaultConfig.address)
      if (apr) {
        return {
          ...vaultConfig,
          apy: convertAprToApy(apr.apr, 365),
        }
      }
      return {
        ...vaultConfig,
        apy: null,
      }
    })
  })

  if (vaults) {
    return vaults
  }

  return new Promise((_, reject) => reject('No data'))
}
