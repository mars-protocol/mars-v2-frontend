import { PerpsModule } from 'components/perps/Module/PerpsModule'
import { PerpsChart } from 'components/perps/PerpsChart'
import { PerpsInfo } from 'components/perps/PerpsInfo'
import { PerpsPositions } from 'components/perps/PerpsPositions'

export default function PerpsPage() {
  return (
    <div className='grid grid-cols-[auto_376px] grid-rows-[min-content_auto_auto] w-full gap-4'>
      <PerpsInfo />
      <div className='h-full w-[376px] row-span-3 relative'>
        <PerpsModule />
      </div>
      <PerpsChart />
      <PerpsPositions />
    </div>
  )
}
