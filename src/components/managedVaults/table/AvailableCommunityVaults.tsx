import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import { CircularProgress } from 'components/common/CircularProgress'
import Table from 'components/common/Table'
import Text from 'components/common/Text'
import useCommunityVaultsColumns from 'components/managedVaults/table/useCommunityVaultsColumns'
import useManagedVaults from 'hooks/managedVaults/useManagedVaults'
import { useMemo } from 'react'
import useStore from 'store'

interface Props {
  title: string
  data: ManagedVaultWithDetails[]
  isLoading: boolean
  hideCard?: boolean
}

export default function AvailableCommunityVaults() {
  const { data, isLoading } = useManagedVaults()
  const address = useStore((s) => s.address)

  const userTabs = useMemo(() => {
    const tabs = []
    if (data.ownedVaults.length > 0) {
      tabs.push({
        title: 'My Vaults',
        renderContent: () => (
          <VaultTable
            title='My Vaults'
            data={data.ownedVaults}
            isLoading={isLoading}
            hideCard={true}
          />
        ),
      })
    }
    if (data.depositedVaults.length > 0) {
      tabs.push({
        title: 'My Deposits',
        renderContent: () => (
          <VaultTable
            title='My Deposits'
            data={data.depositedVaults}
            isLoading={isLoading}
            hideCard={true}
          />
        ),
      })
    }
    return tabs
  }, [data.depositedVaults, data.ownedVaults, isLoading])

  if (isLoading) {
    return (
      <div className='flex justify-center w-full mt-10'>
        <CircularProgress size={50} />
      </div>
    )
  }

  const hasNoVaults =
    !data.ownedVaults.length && !data.depositedVaults.length && !data.availableVaults.length

  if (hasNoVaults) {
    return (
      <Text size='lg' className='text-center w-full p-8 text-white/60'>
        No community vaults have been created yet
      </Text>
    )
  }

  return (
    <>
      {address && <CardWithTabs tabs={userTabs} />}
      <VaultTable title='Available Vaults' data={data.availableVaults} isLoading={isLoading} />
    </>
  )
}

function VaultTable({ title, data, isLoading, hideCard }: Props) {
  const columns = useCommunityVaultsColumns({
    isLoading,
    showPosition: title === 'My Deposits',
  })

  if (!data.length) return null

  return (
    <Table title={title} columns={columns} data={data} initialSorting={[]} hideCard={hideCard} />
  )
}
