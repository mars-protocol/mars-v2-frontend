import Table from 'components/common/Table'
import Text from 'components/common/Text'
import useAvailableHlsFarmsColumns from 'components/hls/Farm/Table/Columns/useAvailableHlsFarmsColumns'
import useHlsFarms from 'hooks/hls/useHlsFarms'

export default function AvailableHlsFarmsTable() {
  const { data: availableHlsFarms, isLoading } = useHlsFarms()
  const columns = useAvailableHlsFarmsColumns({ isLoading })

  if (availableHlsFarms.length === 0)
    return (
      <Text className='p-4 text-center text-white/70' size='sm'>
        There are currently no High Leverage Farms available
      </Text>
    )

  return (
    <Table
      hideCard
      title='Available High Leverage Farms'
      columns={columns}
      data={availableHlsFarms}
      initialSorting={[{ id: 'name', desc: false }]}
    />
  )
}
