import { PerpsModule } from 'components/Perps/Module/PerpsModule'
import { PerpsChart } from 'components/Perps/PerpsChart'
import { PerpsInfo } from 'components/Perps/PerpsInfo'
import { PerpsPositions } from 'components/Perps/PerpsPositions'

export default function PerpsPage() {
  return (
    <div className='grid grid-cols-[auto_376px] grid-rows-[min-content_auto_auto] w-full gap-4'>
      <PerpsInfo />
      <div className='h-full w-[376px] row-span-3'>
        <PerpsModule />
      </div>
      <PerpsChart />
      <PerpsPositions />
    </div>
  )
}
