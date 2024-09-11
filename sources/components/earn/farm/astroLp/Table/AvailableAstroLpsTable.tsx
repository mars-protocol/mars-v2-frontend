import { useMemo } from 'react'
import useActiveAstroLps from '../../../../../hooks/astroLp/useActiveAstroLps'
import useAvailableAstroLps from '../../../../../hooks/astroLp/useAvailableAstroLps'
import Table from '../../../../common/Table'
import Text from '../../../../common/Text'
import useAvailableAstroLpsColumns from './Columns/useAvailableAstroLpsColumns'

export default function AvailableAstroLpsTable() {
  const availableAstroLps = useAvailableAstroLps()
  const activeAstroLps = useActiveAstroLps()
  const columns = useAvailableAstroLpsColumns({ isLoading: false })
  const activeAstroLpsDenoms = useMemo(
    () => activeAstroLps.map((astroLp) => astroLp.denoms.lp),
    [activeAstroLps],
  )
  const filteredAstroLps = useMemo(
    () => availableAstroLps.filter((astroLp) => !activeAstroLpsDenoms.includes(astroLp.denoms.lp)),
    [availableAstroLps, activeAstroLpsDenoms],
  )

  if (filteredAstroLps.length === 0)
    return (
      <Text className='p-4 text-center text-white/70' size='sm'>
        There are no additional LP AstroLps available
      </Text>
    )

  return (
    <Table
      hideCard
      title='Available Astro LPs'
      columns={columns}
      data={filteredAstroLps}
      initialSorting={[{ id: 'name', desc: false }]}
    />
  )
}
