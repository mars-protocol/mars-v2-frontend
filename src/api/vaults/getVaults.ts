import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import { ENV, ENV_MISSING_MESSAGE, IS_TESTNET } from 'constants/env'
import { TESTNET_VAULTS, VAULTS } from 'constants/vaults'
import {
  ArrayOfVaultInfoResponse,
  VaultBaseForString,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { convertAprToApy } from 'utils/parsers'

export default async function getVaults(): Promise<Vault[]> {
  if (!ENV.URL_RPC || !ENV.ADDRESS_CREDIT_MANAGER) {
    return new Promise((_, reject) => reject(ENV_MISSING_MESSAGE))
  }
  const client = await CosmWasmClient.connect(ENV.URL_RPC)

  const $vaultConfigs = getVaultConfigs(client)
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

async function getVaultConfigs(client: CosmWasmClient) {
  let data: VaultConfig[] = []

  const getBatch = async (startAfter?: VaultBaseForString) => {
    if (!ENV.ADDRESS_CREDIT_MANAGER) return
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

    data = [...data, ...batchProcessed]

    if (batch.length === 4) {
      await getBatch({
        address: batchProcessed[batchProcessed.length - 1].address,
      } as VaultBaseForString)
    }
  }

  // TODO: Enable when vaults are deployed
  // await getBatch()
  const vaults = IS_TESTNET ? TESTNET_VAULTS : VAULTS

  return vaults.map((vaultMetaData) => {
    const vaultInfo = data.find((vault) => vault.address === vaultMetaData.address)

    return {
      ...vaultMetaData,
      ...vaultInfo,
    } as VaultConfig
  })
}

interface FlatApr {
  contract_address: string
  apr: { type: string; value: number | string }[]
  fees: { type: string; value: number | string }[]
}

interface NestedApr {
  contract_address: string
  apr: {
    aprs: { type: string; value: number | string }[]
    fees: { type: string; value: number | string }[]
  }
}

async function getAprs() {
  const APOLLO_URL = 'https://api.apollo.farm/api/vault_infos/v2/osmo-test-5'

  try {
    const response = await fetch(APOLLO_URL)

    if (response.ok) {
      const data: FlatApr[] | NestedApr[] = await response.json()

      const newAprs = data.map((aprData) => {
        try {
          const apr = aprData as FlatApr
          const aprTotal = apr.apr.reduce((prev, curr) => Number(curr.value) + prev, 0)
          const feeTotal = apr.fees.reduce((prev, curr) => Number(curr.value) + prev, 0)

          const finalApr = aprTotal + feeTotal

          return { address: aprData.contract_address, apr: finalApr }
        } catch {
          const apr = aprData as NestedApr
          const aprTotal = apr.apr.aprs.reduce((prev, curr) => Number(curr.value) + prev, 0)
          const feeTotal = apr.apr.fees.reduce((prev, curr) => Number(curr.value) + prev, 0)

          const finalApr = aprTotal + feeTotal
          return { address: aprData.contract_address, apr: finalApr }
        }
      })

      return newAprs
    }

    return []
  } catch {
    return []
  }
}
