import { Suspense, useMemo } from 'react'

import Card from 'components/Card'
import { VaultTable } from 'components/Earn/Farm/VaultTable'
import VaultUnlockBanner from 'components/Earn/Farm/VaultUnlockBanner'
import { IS_TESTNET } from 'constants/env'
import { BN_ZERO } from 'constants/math'
import { TESTNET_VAULTS_META_DATA, VAULTS_META_DATA } from 'constants/vaults'
import useAccountId from 'hooks/useAccountId'
import useDepositedVaults from 'hooks/useDepositedVaults'
import useVaults from 'hooks/useVaults'
import { VaultStatus } from 'types/enums/vault'

interface Props {
  type: 'available' | 'deposited'
}

function Content(props: Props) {
  const accountId = useAccountId()
  const { data: vaults } = useVaults()
  const { data: depositedVaults } = useDepositedVaults(accountId || '')
  const isAvailable = props.type === 'available'

  const vaultsMetaData = IS_TESTNET ? TESTNET_VAULTS_META_DATA : VAULTS_META_DATA

  const { deposited, available } = useMemo(() => {
    return vaultsMetaData.reduce(
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
  }, [vaults, depositedVaults, vaultsMetaData])

  const vaultsToDisplay = isAvailable ? available : deposited

  if (!vaultsToDisplay.length) return null

  const unlockedVaults: DepositedVault[] = []

  if (!isAvailable && depositedVaults?.length > 0) {
    depositedVaults.forEach((vault) => {
      if (vault.status === VaultStatus.UNLOCKED) {
        unlockedVaults.push(vault)
      }
    })
  }

  return (
    <>
      {!isAvailable && <VaultUnlockBanner vaults={unlockedVaults} />}
      <Card
        className='w-full h-fit bg-white/5'
        title={isAvailable ? 'Available vaults' : 'Deposited'}
      >
        <VaultTable data={vaultsToDisplay} />
      </Card>
    </>
  )
}

function Fallback() {
  const vaults = IS_TESTNET ? TESTNET_VAULTS_META_DATA : VAULTS_META_DATA
  const mockVaults: Vault[] = vaults.map((vault) => ({
    ...vault,
    apy: null,
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

  return (
    <Card className='w-full h-fit bg-white/5' title='Available vaults'>
      <VaultTable data={mockVaults} isLoading />
    </Card>
  )
}

export function AvailableVaults() {
  return (
    <Suspense fallback={<Fallback />}>
      <Content type='available' />
    </Suspense>
  )
}

export function DepositedVaults() {
  return (
    <Suspense fallback={null}>
      <Content type='deposited' />
    </Suspense>
  )
}
