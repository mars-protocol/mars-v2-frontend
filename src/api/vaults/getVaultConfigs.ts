import { getClient } from 'api/client'
import { ENV, IS_TESTNET } from 'constants/env'
import { TESTNET_VAULTS, VAULTS } from 'constants/vaults'
import {
  ArrayOfVaultInfoResponse,
  VaultBaseForString,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export default async function getVaultConfigs(): Promise<VaultConfig[]> {
  const vaultInfos: VaultInfo[] = await getVaultInfos([])
  const vaults = IS_TESTNET ? TESTNET_VAULTS : VAULTS

  return vaults.map((vaultMetaData) => {
    const vaultConfig = vaultInfos.find((vaultInfo) => vaultInfo.address === vaultMetaData.address)

    return {
      ...vaultMetaData,
      ...vaultConfig,
    } as VaultConfig
  })
}

const getVaultInfos = async (
  vaultInfos: VaultInfo[],
  startAfter?: VaultBaseForString,
): Promise<VaultInfo[]> => {
  if (!ENV.ADDRESS_CREDIT_MANAGER) return []
  const client = await getClient()
  try {
    const batch: ArrayOfVaultInfoResponse = await client.queryContractSmart(
      ENV.ADDRESS_CREDIT_MANAGER,
      {
        vaults_info: { limit: 4, start_after: startAfter },
      },
    )

    const batchProcessed = batch?.map((vaultInfo) => {
      return {
        address: vaultInfo.vault.address,
        cap: {
          denom: vaultInfo.config.deposit_cap.denom,
          used: Number(vaultInfo.utilization.amount),
          max: Number(vaultInfo.config.deposit_cap.amount),
        },
        ltv: {
          max: Number(vaultInfo.config.max_ltv),
          liq: Number(vaultInfo.config.liquidation_threshold),
        },
      } as VaultConfig
    })

    vaultInfos.push(...batchProcessed)

    if (batch.length === 4) {
      return await getVaultInfos(vaultInfos, {
        address: batchProcessed[batchProcessed.length - 1].address,
      } as VaultBaseForString)
    }

    return vaultInfos
  } catch {
    return vaultInfos
  }
}
