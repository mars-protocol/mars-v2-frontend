import { Suspense } from 'react'
import { useParams } from 'react-router-dom'

import Card from 'components/Card'
import { VaultTable } from 'components/Earn/vault/VaultTable'
import Text from 'components/Text'
import { IS_TESTNET } from 'constants/env'
import { TESTNET_VAULTS_META_DATA, VAULTS_META_DATA } from 'constants/vaults'
import useDepositedVaults from 'hooks/useDepositedVaults'

function Content() {
  const { accountId } = useParams()
  const { data: vaults } = useDepositedVaults(accountId || '')

  if (!vaults.length) return null

  return <VaultTable data={vaults} />
}

export default function DepositedVaults() {
  return (
    <Card title='Deposited' className='mb-4 h-fit w-full bg-white/5'>
      <Suspense fallback={<Fallback />}>
        <Content />
      </Suspense>
    </Card>
  )
}

function Fallback() {
  // TODO: Replace with loading state of vaulttable
  const vaults = IS_TESTNET ? TESTNET_VAULTS_META_DATA : VAULTS_META_DATA
  return (
    <>
      {vaults.map((vault) => (
        <Text key={vault.address}>{vault.name}</Text>
      ))}
    </>
  )
}
