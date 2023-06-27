import { Suspense, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import Card from 'components/Card'
import { VaultTable } from 'components/Earn/vault/VaultTable'
import { IS_TESTNET } from 'constants/env'
import { TESTNET_VAULTS_META_DATA, VAULTS_META_DATA } from 'constants/vaults'
import useVaults from 'hooks/useVaults'
import useDepositedVaults from 'hooks/useDepositedVaults'
import { BN } from 'utils/helpers'

interface Props {
  type: 'available' | 'deposited'
}

function Content(props: Props) {
  const { accountId } = useParams()
  const { data: vaults } = useVaults()
  const { data: depositedVaults } = useDepositedVaults(accountId || '')

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

  const vaultsToDisplay = props.type === 'available' ? available : deposited

  if (!vaultsToDisplay.length) return null

  return <VaultTable data={vaultsToDisplay} />
}

export default function Vaults(props: Props) {
  return (
    <Card
      title={props.type === 'available' ? 'Available vaults' : 'Deposited'}
      className='mb-4 h-fit w-full bg-white/5'
    >
      <Suspense fallback={props.type === 'available' ? <Fallback /> : null}>
        <Content type={props.type} />
      </Suspense>
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

  return <VaultTable data={mockVaults} isLoading />
}
