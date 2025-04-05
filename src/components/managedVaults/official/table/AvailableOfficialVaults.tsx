import { CircularProgress } from 'components/common/CircularProgress'
import Table from 'components/common/Table'
import Text from 'components/common/Text'
import useOfficialVaultsColumns from 'components/managedVaults/official/table/useOfficialVaultsColumns'
import useManagedVaults from 'hooks/managedVaults/useManagedVaults'
import useStore from 'store'

interface Props {
  title: string
  data: ManagedVaultsData[]
  isLoading: boolean
  hideCard?: boolean
}

export function AvailableOfficialVaults() {
  const { data, isLoading } = useManagedVaults()
  const address = useStore((s) => s.address)

  if (isLoading) {
    return (
      <div className='flex justify-center w-full mt-10'>
        <CircularProgress size={50} />
      </div>
    )
  }

  const noVaultsAvailable = !data.depositedVaults.length && !data.availableVaults.length
  if (!isLoading && noVaultsAvailable) {
    return (
      <Text size='lg' className='text-center w-full p-8 text-white/60'>
        No official vaults have been created yet
      </Text>
    )
  }

  return (
    <>
      {address && data.depositedVaults.length > 0 && (
        <VaultTable title='My Deposits' data={data.depositedVaults} isLoading={isLoading} />
      )}
      <VaultTable title='Available Vaults' data={data.availableVaults} isLoading={isLoading} />
    </>
  )
}

function VaultTable({ title, data, isLoading, hideCard }: Props) {
  const columns = useOfficialVaultsColumns({
    isLoading,
  })

  if (!data.length) return null

  return (
    <Table title={title} columns={columns} data={data} initialSorting={[]} hideCard={hideCard} />
  )
}
