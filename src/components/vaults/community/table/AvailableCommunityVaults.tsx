import Table from 'components/common/Table'
import Text from 'components/common/Text'
import useCommunityVaultsColumns from 'components/vaults/community/table/useCommunityVaultsColumns'
import useManagedVaults from 'hooks/managedVaults/useManagedVaults'
import useStore from 'store'
interface Props {
  title: string
  data: ManagedVaultsData[]
  isLoading: boolean
}

export default function AvailableCommunityVaults() {
  const { data, isLoading } = useManagedVaults()
  const address = useStore((s) => s.address)

  const noVaultsAvailable = !data?.ownedVaults?.length && !data?.availableVaults?.length

  if (!isLoading && noVaultsAvailable) {
    return (
      <Text size='lg' className='text-center w-full p-8 text-white/60'>
        No community vaults have been created yet
      </Text>
    )
  }

  return (
    <>
      {address && (
        <VaultTable title='My Vaults' data={data?.ownedVaults ?? []} isLoading={isLoading} />
      )}
      <VaultTable
        title='Available Vaults'
        data={data?.availableVaults ?? []}
        isLoading={isLoading}
      />
    </>
  )
}

function VaultTable({ title, data, isLoading }: Props) {
  const columns = useCommunityVaultsColumns({ isLoading })

  if (!data.length) return null

  return <Table title={title} columns={columns} data={data} initialSorting={[]} />
}
