import useSWR from 'swr'

import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

import useChainConfig from '../useChainConfig'

export default function useArbVault() {
  const chainConfig = useChainConfig()
  const vaults = chainConfig.vaults
  const client = useStore((s) => s.client)

  return useSWR(!!vaults?.length && `chains/${chainConfig.id}/arb-vaults/`, async () => {
    const totalAssets = await client?.cosmWasmClient.queryContractSmart(vaults[0].address, {
      total_assets: {},
    })
    const totalVaultTokens = await client?.cosmWasmClient.queryContractSmart(vaults[0].address, {
      total_vault_token_supply: {},
    })

    const apy = await fetch(
      `https://mars-wif-bots-5e8e.onrender.com/api/vaults/${vaults[0].address}/apy`,
    ).then((res) => res.json().then((data) => data[0]?.apy))

    return {
      ...vaults[0],
      tvl: BNCoin.fromDenomAndBigNumber(vaults[0].denoms.primary, BN(totalAssets)),
      vaultTokenSupply: BN(totalVaultTokens),
      apy,
    }
  })
}
