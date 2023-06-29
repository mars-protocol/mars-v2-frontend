import { convertAprToApy } from 'utils/parsers'
import getAprs from 'api/vaults/getVaultAprs'
import { getVaultConfigs } from 'api/vaults/getVaultConfigs'
import { getVaultUtilizations } from 'api/vaults/getVaultUtilizations'
import { ENV } from 'constants/env'
import { TESTNET_VAULTS_META_DATA, VAULTS_META_DATA } from 'constants/vaults'
import { BN } from 'utils/helpers'

export default async function getVaults(): Promise<Vault[]> {
  const vaultConfigs = await getVaultConfigs([])
  const $vaultUtilizations = getVaultUtilizations(vaultConfigs)
  const $aprs = getAprs()
  const vaultMetaDatas = ENV.NETWORK === 'testnet' ? TESTNET_VAULTS_META_DATA : VAULTS_META_DATA

  const vaults: Vault[] = []
  await Promise.all([$vaultUtilizations, $aprs]).then(([vaultUtilizations, aprs]) => {
    return vaultConfigs.map((vaultConfig) => {
      const apr = aprs.find((apr) => apr.address === vaultConfig.addr)
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
        apy: apr ? convertAprToApy(apr.apr, 365) : null,
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
