import { Suspense } from 'react'

import Card from 'components/Card'
import { VaultTable } from 'components/Earn/vault/VaultTable'
import Text from 'components/Text'
import { IS_TESTNET } from 'constants/env'
import { TESTNET_VAULTS_META_DATA, VAULTS_META_DATA } from 'constants/vaults'
import useVaults from 'hooks/useVaults'

function Content() {
  const { data: vaults } = useVaults()

  if (!vaults.length) return null

  return <VaultTable data={vaults} />
}

export default function AvailableVaults() {
  return (
    <Card title='Available vaults' className='mb-4 h-fit w-full bg-white/5'>
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
