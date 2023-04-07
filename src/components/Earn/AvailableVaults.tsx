import Card from 'components/Card'
import { Suspense } from 'react'
import { getVaults } from 'utils/api'
import { Text } from 'components/Text'
import { VAULTS } from 'constants/vaults'

async function Content() {
  const vaults = await getVaults()

  if (!vaults.length) return null

  return vaults.map((vault) => {
    return <Text>{vault.name}</Text>
  })
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
  return (
    <>
      {VAULTS.map((vault) => (
        <Text>{vault.name}</Text>
      ))}
    </>
  )
}
