import getAssetParams from 'api/params/getAssetParams'
import getAprs from 'api/vaults/getVaultAprs'
import { getVaultConfigs } from 'api/vaults/getVaultConfigs'
import { getVaultUtilizations } from 'api/vaults/getVaultUtilizations'
import { ENV } from 'constants/env'
import { TESTNET_VAULTS_META_DATA, VAULTS_META_DATA } from 'constants/vaults'
import { NETWORK } from 'types/enums/network'
import { BN } from 'utils/helpers'
import { convertAprToApy } from 'utils/parsers'
import { resolveHLSStrategies } from 'utils/resolvers'

export default async function getVaults(): Promise<Vault[]> {
  const assetParams = await getAssetParams()
  const vaultConfigs = await getVaultConfigs()
  const $vaultUtilizations = getVaultUtilizations(vaultConfigs)
  const $aprs = getAprs()
  const vaultMetaDatas =
    ENV.NETWORK === NETWORK.TESTNET ? TESTNET_VAULTS_META_DATA : VAULTS_META_DATA
  const HLSAssets = assetParams.filter((asset) => asset.credit_manager.hls)
  const hlsStrategies = resolveHLSStrategies('vault', HLSAssets)

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
        apr: apr ? apr.apr : null,
        ltv: {
          max: Number(vaultConfig.max_loan_to_value),
          liq: Number(vaultConfig.liquidation_threshold),
        },
      }

      const hlsStrategy = hlsStrategies.find(
        (strategy) => strategy.denoms.deposit === vaultConfig.addr,
      )
      if (hlsStrategy) {
        vault.hls = {
          maxLTV: hlsStrategy.maxLTV,
          maxLeverage: hlsStrategy.maxLeverage,
          borrowDenom: hlsStrategy.denoms.borrow,
        }
      }

      vaults.push(vault)
    })
  })

  if (vaults) {
    return vaults
  }

  return new Promise((_, reject) => reject('No data'))
}
