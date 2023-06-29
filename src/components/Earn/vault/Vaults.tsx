import { Suspense, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import classNames from 'classnames'
import Card from 'components/Card'
import { VaultTable } from 'components/Earn/vault/VaultTable'
import { IS_TESTNET } from 'constants/env'
import { TESTNET_VAULTS_META_DATA, VAULTS_META_DATA } from 'constants/vaults'
import useDepositedVaults from 'hooks/useDepositedVaults'
import useVaults from 'hooks/useVaults'
import { BN } from 'utils/helpers'

interface Props {
  type: 'available' | 'deposited'
}

function Content(props: Props) {
  const { accountId } = useParams()
  const { data: vaults } = useVaults()
  const { data: depositedVaults } = useDepositedVaults(accountId || '')
  const isAvailable = props.type === 'available'

  const vaultsMetaData = IS_TESTNET ? TESTNET_VAULTS_META_DATA : VAULTS_META_DATA

  const { deposited, available } = useMemo(() => {
    return vaultsMetaData.reduce(
      (prev: { deposited: DepositedVault[]; available: Vault[] }, curr) => {
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

  return (
    <Card
      className={classNames('h-fit w-full bg-white/5', !isAvailable && 'mb-4')}
      title={isAvailable ? 'Available vaults' : 'Deposited'}
    >
      <VaultTable data={vaultsToDisplay} />
    </Card>
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
      used: BN(0),
      max: BN(0),
    },
  }))

  return (
    <Card className='h-fit w-full bg-white/5' title='Available vaults'>
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
