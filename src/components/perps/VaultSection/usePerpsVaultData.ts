import { useMemo } from 'react'
import useDepositedVaults from 'hooks/vaults/useDepositedVaults'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import { byDenom } from 'utils/array'

export default function usePerpsVaultData(accountId: string) {
  const { data: depositedVaults } = useDepositedVaults(accountId)
  const whitelistedAssets = useWhitelistedAssets()
  const chainConfig = useChainConfig()

  return useMemo(() => {
    const perpsVaults = depositedVaults.filter((vault) => vault.type === 'perp')
    const perpsVaultDenom = chainConfig.stables[0]
    const asset = whitelistedAssets.find(byDenom(perpsVaultDenom))

    if (!asset) return []

    return perpsVaults.map((vault) => ({
      ...vault,
      asset,
    }))
  }, [depositedVaults, whitelistedAssets, chainConfig])
}
