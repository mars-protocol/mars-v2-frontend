import { PerpsModule } from 'components/perps/Module/PerpsModule'
import { PerpsChart } from 'components/perps/PerpsChart'
import { PerpsPositions } from 'components/perps/PerpsPositions'

export default function PerpsPage() {
  return (
    <div className='md:grid flex flex-wrap w-full md:grid-cols-[auto_346px] gap-4'>
      <div>
        <PerpsChart />
      </div>
      <div className='row-span-2'>
        <PerpsModule />
      </div>
      <PerpsPositions />
    </div>
  )
}
