import { getVaultConfigs } from 'api/vaults/getVaultConfigs'
import { getVaultUtilizations } from 'api/vaults/getVaultUtilizations'
import { BN } from 'utils/helpers'

export default async function getVaults(chainConfig: ChainConfig): Promise<Vault[]> {
  const vaultConfigs = await getVaultConfigs(chainConfig)
  const $vaultUtilizations = getVaultUtilizations(chainConfig, vaultConfigs)
  const vaultMetaDatas = chainConfig.vaults

  const vaults: Vault[] = []
  await $vaultUtilizations.then((vaultUtilizations) => {
    return vaultConfigs.map((vaultConfig) => {
      const vaultMetaData = vaultMetaDatas.find(
        (vaultMetaData) => vaultMetaData.address === vaultConfig.addr,
      )

      if (!vaultMetaData) return

      const vault: Vault = {
        ...vaultMetaData,
        cap: {
          max: BN(vaultConfig.deposit_cap.amount),
          denom: vaultConfig.deposit_cap.denom,
          used: BN(
            vaultUtilizations.find(
              (vaultUtilization) => vaultUtilization.vault.address === vaultConfig.addr,
            )?.utilization.amount || 0,
          ),
        },
        ltv: {
          max: Number(vaultConfig.max_loan_to_value),
          liq: Number(vaultConfig.liquidation_threshold),
        },
      }

      vaults.push(vault)
    })
  })

  if (vaults) {
    return vaults
  }

  return new Promise((_, reject) => reject('No data'))
}
