import { Suspense } from 'react'
import useSWR from 'swr'

import Card from 'components/Card'
import VaultCard from 'components/Earn/vault/VaultCard'
import getVaults from 'api/vaults/getVaults'

function Content() {
  const { data: vaults } = useSWR('vaults', getVaults, { suspense: true })

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
      <Content />
    </Suspense>
  )
}
