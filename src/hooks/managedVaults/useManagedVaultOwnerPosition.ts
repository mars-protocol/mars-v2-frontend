import useSWR from 'swr'
import useChainConfig from 'hooks/chain/useChainConfig'
import { getManagedVaultUserPosition } from 'api/cosmwasm-client'
import { BN } from 'utils/helpers'

const DEFAULT_OWNER_POSITION_RESPONSE = {
  pnl: '0',
  shares: '0',
}

export default function useManagedVaultOwnerPosition(
  vaultAddress: string,
  ownerAddress: string | undefined,
) {
  const chainConfig = useChainConfig()

  const { data } = useSWR(
    vaultAddress && ownerAddress
      ? `chains/${chainConfig.id}/managedVaults/${vaultAddress}/ownerPosition`
      : null,
    async () => {
      if (!ownerAddress) return DEFAULT_OWNER_POSITION_RESPONSE
      return await getManagedVaultUserPosition(chainConfig, vaultAddress, ownerAddress)
    },
    {
      refreshInterval: 10_000,
      suspense: false,
    },
  )

  const calculateOwnerVaultShare = (totalVaultTokens: string): number => {
    if (!data?.shares || !totalVaultTokens || BN(totalVaultTokens).isZero()) {
      return 0
    }
    return BN(data.shares).multipliedBy(100).dividedBy(totalVaultTokens).toNumber()
  }

  return {
    data,
    calculateOwnerVaultShare,
  }
}
