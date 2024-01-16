import { useSearchParams } from 'react-router-dom'

import { PerpsManageModule } from 'components/perps/Module/PerpsManageModule'
import { PerpsModule } from 'components/perps/Module/PerpsModule'
import { PerpsChart } from 'components/perps/PerpsChart'
import { PerpsInfo } from 'components/perps/PerpsInfo'
import { PerpsPositions } from 'components/perps/PerpsPositions'
import { SearchParams } from 'types/enums/searchParams'

export default function PerpsPage() {
  const [searchParams] = useSearchParams()

  const isManagingPosition = searchParams.get(SearchParams.PERPS_MANAGE) === 'true'

  return (
    <div className='grid grid-cols-[auto_376px] grid-rows-[min-content_auto_auto] w-full gap-4'>
      <PerpsInfo />
      <div className='h-full w-[376px] row-span-3 relative'>
        {isManagingPosition ? <PerpsManageModule /> : <PerpsModule />}
      </div>
      <PerpsChart />
      <PerpsPositions />
    </div>
  )
}
