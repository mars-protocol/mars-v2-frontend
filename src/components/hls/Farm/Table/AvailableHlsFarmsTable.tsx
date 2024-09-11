import Table from 'components/common/Table'
import Text from 'components/common/Text'
import useHlsFarms from 'hooks/hls/useHlsFarms'
import useAvailableHlsFarmsColumns from './Columns/useAvailableHlsFarmsColumns'

export default function AvailableHlsFarmsTable() {
  const { data: availableHlsFarms, isLoading } = useHlsFarms()
  const columns = useAvailableHlsFarmsColumns({ isLoading })
  const availableAstroLps = availableHlsFarms.map((HlsFarm) => HlsFarm.farm)

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
      data={availableAstroLps}
      initialSorting={[{ id: 'name', desc: false }]}
    />
  )
}
