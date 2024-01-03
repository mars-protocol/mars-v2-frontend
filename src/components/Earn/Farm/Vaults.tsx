import { Suspense, useMemo } from 'react'

import AvailableVaultsTable from 'components/Earn/Farm/Table/AvailableVaultsTable'
import DepositedVaultsTable from 'components/Earn/Farm/Table/DepositedVaultsTable'
import VaultUnlockBanner from 'components/Earn/Farm/VaultUnlockBanner'
import { BN_ZERO } from 'constants/math'
import useAccountId from 'hooks/useAccountId'
import useDepositedVaults from 'hooks/useDepositedVaults'
import useVaults from 'hooks/useVaults'
import useStore from 'store'
import { VaultStatus } from 'types/enums/vault'

function Content() {
  const accountId = useAccountId()
  const { data: vaults } = useVaults()
  const { data: depositedVaults } = useDepositedVaults(accountId || '')

  const vaultMetaData = useStore((s) => s.chainConfig.vaults)

  const { deposited, available } = useMemo(() => {
    return vaultMetaData.reduce(
      (prev: { deposited: DepositedVault[]; available: Vault[] }, curr) => {
        if (!vaults) return prev
        const vault = vaults.find((vault) => vault.address === curr.address)
        const depositedVault = depositedVaults?.find((vault) => vault.address === curr.address)

        if (depositedVault) {
          prev.deposited.push(depositedVault)
        } else if (vault) {
          prev.available.push(vault)
        }

        return prev
      },
      { deposited: [], available: [] },
    )
  }, [vaults, depositedVaults, vaultMetaData])

  const unlockedVaults: DepositedVault[] = []

  if (depositedVaults?.length > 0) {
    depositedVaults.forEach((vault) => {
      if (vault.status === VaultStatus.UNLOCKED) {
        unlockedVaults.push(vault)
      }
    })
  }

  return (
    <>
      <VaultUnlockBanner vaults={unlockedVaults} />
      {deposited.length > 0 && (
        <DepositedVaultsTable data={deposited as DepositedVault[]} isLoading={false} />
      )}
      {available.length > 0 && (
        <AvailableVaultsTable data={available as Vault[]} isLoading={false} />
      )}
    </>
  )
}

function Fallback() {
  const vaults = useStore((s) => s.chainConfig.vaults)
  const mockVaults: Vault[] = vaults.map((vault) => ({
    ...vault,
    apy: null,
    apr: null,
    ltv: {
      max: 0,
      liq: 0,
    },
    cap: {
      denom: 'denom',
      used: BN_ZERO,
      max: BN_ZERO,
    },
  }))

  return <AvailableVaultsTable data={mockVaults} isLoading />
}

export default function Vaults() {
  return (
    <Suspense fallback={<Fallback />}>
      <Content />
    </Suspense>
  )
}
