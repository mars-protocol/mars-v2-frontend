import { Suspense } from 'react'

import Card from 'components/Card'
import Text from 'components/Text'
import { VAULTS } from 'constants/vaults'
import { getVaults } from 'utils/api'

import { VaultTable } from './VaultTable'

async function Content() {
  const vaults = await getVaults()
  console.log(vaults)

  if (!vaults.length) return null

  return <VaultTable data={vaults} />
}

export default function AvailableVaults() {
  return (
    <Card title='Available vaults' className='mb-4 h-fit w-full bg-white/5'>
      <Suspense fallback={<Fallback />}>
        {/* @ts-expect-error Server Component */}
        <Content />
      </Suspense>
    </Card>
  )
}

function Fallback() {
  // TODO: Replace with loading state of vaulttable
  return (
    <>
      {VAULTS.map((vault) => (
        <Text key={vault.address}>{vault.name}</Text>
      ))}
    </>
  )
}
