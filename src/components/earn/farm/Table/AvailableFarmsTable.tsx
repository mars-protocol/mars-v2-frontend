import Table from 'components/common/Table'
import Text from 'components/common/Text'
import useAvailableFarmsColumns from 'components/earn/farm/Table/Columns/useAvailableFarmsColumns'
import useActiveFarms from 'hooks/farms/useActiveFarms'
import useAvailableFarms from 'hooks/farms/useAvailableFarms'
import { useMemo } from 'react'

export default function AvailableFarmsTable() {
  const availableFarms = useAvailableFarms()
  const activeFarms = useActiveFarms()
  const columns = useAvailableFarmsColumns({ isLoading: false })
  const activeFarmsDenoms = useMemo(() => activeFarms.map((farm) => farm.denoms.lp), [activeFarms])
  const filteredFarms = useMemo(
    () => availableFarms.filter((farm) => !activeFarmsDenoms.includes(farm.denoms.lp)),
    [availableFarms, activeFarmsDenoms],
  )

  if (filteredFarms.length === 0)
    return (
      <Text className='p-4 text-center text-white/70' size='sm'>
        No additional LP Farms available
      </Text>
    )

  return (
    <Table
      hideCard
      title='Available LP Farms'
      columns={columns}
      data={filteredFarms}
      initialSorting={[{ id: 'name', desc: true }]}
    />
  )
}
