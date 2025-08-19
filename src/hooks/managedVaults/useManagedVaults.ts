import { getManagedVaultDetails, getManagedVaultOwnerAddress } from 'api/cosmwasm-client'
import getManagedVaults from 'api/managedVaults/getManagedVaults'
import { useManagedVaultDeposits } from 'hooks/managedVaults/useManagedVaultDeposits'
import { useDepositedManagedVaultsFallback } from 'hooks/managedVaults/useDepositedManagedVaultsFallback'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import useSWR, { mutate } from 'swr'
import { useEffect, useMemo, useState } from 'react'
import BN from 'bignumber.js'

export default function useManagedVaults() {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)
  const { data: fallbackUserVaults, isLoading: isFallbackLoading } =
    useDepositedManagedVaultsFallback()

  const pendingVault = useMemo(() => {
    try {
      const storedVault = localStorage.getItem('pendingVaultMint')
      if (!storedVault) return null
      const parsedVault = JSON.parse(storedVault)
      if (parsedVault.creatorAddress === address) {
        return parsedVault
      }
      return null
    } catch (error) {
      console.error('Failed to parse pending vault:', error)
      return null
    }
  }, [address])

  const {
    data: vaultsResponse,
    isLoading,
    error,
  } = useSWR(
    `chains/${chainConfig.id}/managedVaults`,
    async () => {
      try {
        const managedVaults = await getManagedVaults(chainConfig)
        const vaultsWithDetails = await Promise.all(
          managedVaults.data.map(async (vault) => {
            try {
              const details = await getManagedVaultDetails(chainConfig, vault.vault_address)
              if (!details) return null
              let owner = null
              if (address) {
                owner = await getManagedVaultOwnerAddress(chainConfig, vault.vault_address)
              }

              return {
                ...vault,
                fee_rate: BN(details.performance_fee_config.fee_rate)
                  .multipliedBy(8760)
                  .multipliedBy(100)
                  .integerValue(BN.ROUND_HALF_UP)
                  .toNumber(),
                base_tokens_denom: details.base_token,
                base_tokens_amount: details.total_base_tokens,
                vault_tokens_denom: details.vault_token,
                vault_tokens_amount: details.total_vault_tokens,
                isOwner: owner === address,
                isPending: pendingVault?.address === vault.vault_address,
              } as ManagedVaultWithDetails
            } catch (error) {
              console.error(`Error fetching details for vault ${vault.vault_address}:`, error)
              return null
            }
          }),
        )

        // Filter out any nulls (errored vaults)
        const filteredVaultsWithDetails = vaultsWithDetails.filter(
          (vault): vault is ManagedVaultWithDetails => vault !== null,
        )

        // Add pending vault if it exists and isn't in the API response yet
        if (
          pendingVault &&
          pendingVault.creatorAddress === address &&
          !filteredVaultsWithDetails.some(
            (vault) => vault.vault_address === pendingVault.vaultAddress,
          )
        ) {
          try {
            filteredVaultsWithDetails.push({
              vault_address: pendingVault.vaultAddress,
              account_id: '',
              title: pendingVault.params.title,
              subtitle: '',
              description: pendingVault.params.description,
              fee_rate: BN(pendingVault.params.performanceFee.fee_rate)
                .multipliedBy(8760)
                .multipliedBy(100)
                .integerValue(BN.ROUND_HALF_UP)
                .toNumber(),
              fee: '0',
              tvl: '0',
              apr: '0',
              base_tokens_denom: pendingVault.params.baseToken,
              base_tokens_amount: '0',
              vault_tokens_denom: pendingVault.params.vaultToken,
              vault_tokens_amount: '0',
              isOwner: pendingVault.creatorAddress === address,
              isPending: true,
              ownerAddress: pendingVault.creatorAddress,
            } as ManagedVaultWithDetails)
          } catch (error) {
            console.error(
              `Error fetching details for pending vault ${pendingVault.vaultAddress}:`,
              error,
            )
          }
        }

        return filteredVaultsWithDetails
      } catch (error) {
        console.error('Error fetching vaults:', error)
        return []
      }
    },
    {
      revalidateOnFocus: false,
      suspense: false,
      refreshInterval: (latestData) => {
        if (
          Array.isArray(latestData) &&
          (latestData.length === 0 ||
            !latestData.some((vault) => BN(vault.base_tokens_amount).isGreaterThan(0)))
        ) {
          return 2000 // 2 seconds if empty
        }
        return 120000 // else 120 seconds
      },
    },
  )

  // Add local state for last valid (non-empty) vaults
  const [lastValidVaults, setLastValidVaults] = useState<ManagedVaultWithDetails[]>([])
  useEffect(() => {
    if (
      vaultsResponse &&
      vaultsResponse.length > 0 &&
      vaultsResponse.some((vault) => BN(vault.base_tokens_amount).isGreaterThan(0))
    ) {
      setLastValidVaults(vaultsResponse)
    }
  }, [vaultsResponse])

  // Use last valid data if current response is empty or returns no funded vaults
  const dataToUse =
    vaultsResponse &&
    vaultsResponse.length > 0 &&
    vaultsResponse.some((vault) => BN(vault.base_tokens_amount).isGreaterThan(0))
      ? vaultsResponse
      : lastValidVaults

  const vaultDeposits = useManagedVaultDeposits(address, dataToUse ?? [])
  const result = useMemo(() => {
    if (error || !dataToUse || dataToUse.length === 0) {
      return {
        ownedVaults: fallbackUserVaults.filter((vault) => vault.isOwner) || [],
        depositedVaults: fallbackUserVaults.filter((vault) => !vault.isOwner) || [],
        availableVaults: [],
      }
    }
    // Filter out unfunded vaults (those with zero total_base_tokens) for available vaults table
    const fundedVaults = dataToUse.filter((vault) => BN(vault.base_tokens_amount).isGreaterThan(0))
    return {
      ownedVaults: address ? dataToUse.filter((vault) => vault.isOwner) : [],
      depositedVaults: address
        ? dataToUse.filter(
            (vault) => !vault.isOwner && vaultDeposits.get(vault.vault_tokens_denom) === true,
          )
        : [],
      availableVaults: address
        ? fundedVaults.filter(
            (vault) => !vault.isOwner && vaultDeposits.get(vault.vault_tokens_denom) !== true,
          )
        : fundedVaults,
    }
  }, [dataToUse, vaultDeposits, address, error, fallbackUserVaults])

  return {
    data: result,
    isLoading: (isLoading || isFallbackLoading) && dataToUse.length === 0,
  }
}
