import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import getAssetParams from 'api/params/getAssetParams'
import { getVaultConfigs } from 'api/vaults/getVaultConfigs'
import { BN } from 'utils/helpers'
import { resolveHLSStrategies } from 'utils/resolvers'

export default async function getHLSVaults(chainConfig: ChainConfig) {
  const assetParams = await getAssetParams(chainConfig)
  const client = await getCreditManagerQueryClient(chainConfig)
  const vaultConfigs = await getVaultConfigs(chainConfig)
  const HLSAssets = assetParams.filter((asset) => asset.credit_manager.hls)
  const strategies = resolveHLSStrategies('vault', HLSAssets)

  const vaultUtilizations$ = strategies.map((strategy) =>
    client.vaultUtilization({ vault: { address: strategy.denoms.deposit } }),
  )

  return Promise.all(vaultUtilizations$).then((vaultUtilizations) =>
    vaultUtilizations.map(
      (utilization, index) =>
        ({
          ...strategies[index],
          depositCap: {
            denom: utilization.vault.address,
            used: BN(utilization.utilization.amount),
            max: BN(
              vaultConfigs.find((config) => config.addr === utilization.vault.address)?.deposit_cap
                .amount || 0,
            ),
          },
        }) as HLSStrategy,
    ),
  )
}
