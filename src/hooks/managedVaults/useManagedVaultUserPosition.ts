import useSWR from 'swr'
import useChainConfig from 'hooks/chain/useChainConfig'
import { getManagedVaultUserPosition } from 'api/cosmwasm-client'
import { BN } from 'utils/helpers'

const DEFAULT_USER_POSITION_RESPONSE = {
  pnl: '0',
  shares: '0',
}

export default function useManagedVaultUserPosition(
  vaultAddress: string,
  userAddress: string | undefined,
) {
  const chainConfig = useChainConfig()

  const { data, ...rest } = useSWR(
    vaultAddress && userAddress
      ? `chains/${chainConfig.id}/managedVaults/${vaultAddress}/userPosition`
      : null,
    async () => {
      if (!userAddress) return DEFAULT_USER_POSITION_RESPONSE
      return await getManagedVaultUserPosition(chainConfig, vaultAddress, userAddress)
    },
    {
      refreshInterval: 10_000,
      suspense: false,
    },
  )

  const calculateVaultShare = (totalVaultTokens: string): number => {
    if (!data?.shares || !totalVaultTokens || BN(totalVaultTokens).isZero()) {
      return 0
    }
    return BN(data.shares).multipliedBy(100).dividedBy(totalVaultTokens).toNumber()
  }

  const calculateROI = (currentBalance: string | number | undefined): number => {
    if (!data?.pnl || !currentBalance || BN(currentBalance).isZero()) {
      return 0
    }
    return BN(data.pnl).multipliedBy(100).dividedBy(currentBalance).toNumber()
  }

  return {
    data,
    calculateVaultShare,
    calculateROI,
    ...rest,
  }
}
