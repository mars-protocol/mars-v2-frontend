import { Suspense } from 'react'

import Card from 'components/Card'
import { getVaults } from 'utils/api'
import VaultCard from 'components/earn/vault/VaultCard'

async function Content() {
  const vaults = await getVaults()

  const featuredVaults = vaults.filter((vault) => vault.isFeatured)

  if (!featuredVaults.length) return null

  return (
    <Card
      title='Featured vaults'
      className='mb-4 h-fit w-full bg-white/5'
      contentClassName='grid grid-cols-3'
    >
      {featuredVaults.map((vault) => (
        <VaultCard
          key={vault.address}
          vault={vault}
          title={vault.name}
          subtitle='Hot off the presses'
          provider={vault.provider}
        />
      ))}
    </Card>
  )
}

export default function FeaturedVaults() {
  return (
    <Suspense fallback={null}>
      {/* @ts-expect-error Server Component */}
      <Content />
    </Suspense>
  )
}
