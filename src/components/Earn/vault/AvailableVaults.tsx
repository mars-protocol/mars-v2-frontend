import { Suspense } from 'react'

import Card from 'components/Card'
import { VaultTable } from 'components/Earn/vault/VaultTable'
import Text from 'components/Text'
import { IS_TESTNET } from 'constants/env'
import { TESTNET_VAULTS, VAULTS } from 'constants/vaults'
import useSWR from 'swr'
import getVaults from 'api/vaults/getVaults'

function Content() {
  const { data: vaults } = useSWR('vaults', getVaults, { suspense: true })

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
  const vaults = IS_TESTNET ? TESTNET_VAULTS : VAULTS
  return (
    <>
      {vaults.map((vault) => (
        <Text key={vault.address}>{vault.name}</Text>
      ))}
    </>
  )
}
