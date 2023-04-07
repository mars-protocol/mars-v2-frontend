import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { NextApiRequest, NextApiResponse } from 'next'

import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'
import {
  ArrayOfVaultInfoResponse,
  VaultBaseForString,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { VAULTS } from 'constants/vaults'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!ENV.URL_RPC || !ENV.ADDRESS_CREDIT_MANAGER) {
    return res.status(404).json(ENV_MISSING_MESSAGE)
  }
  const client = await CosmWasmClient.connect(ENV.URL_RPC)

  const vaultConfigs: VaultConfig[] = await getVaultConfigs(client)

  if (vaultConfigs) {
    return res.status(200).json(vaultConfigs)
  }

  return res.status(404)
}

async function getVaultConfigs(client: CosmWasmClient, startAfter?: VaultBaseForString) {
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

  await getBatch()

  return VAULTS.map((vaultMetaData) => {
    const vaultInfo = data.find((vault) => vault.address === vaultMetaData.address)

    return {
      ...vaultMetaData,
      ...vaultInfo,
    } as VaultConfig
  })
}
