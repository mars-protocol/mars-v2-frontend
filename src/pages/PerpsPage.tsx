import { PerpsModule } from 'components/perps/Module/PerpsModule'
import { PerpsChart } from 'components/perps/PerpsChart'
import { PerpsInfo } from 'components/perps/PerpsInfo'
import { PerpsPositions } from 'components/perps/PerpsPositions'

export default function PerpsPage() {
  return (
    <div className='flex flex-col w-full h-full gap-4'>
      <div className='md:grid flex flex-wrap w-full md:grid-cols-[auto_346px] gap-4'>
        <PerpsInfo />
        <div className='relative order-4 w-full h-full md:row-span-3 md:order-2'>
          <PerpsModule />
        </div>
        <PerpsChart />
        <PerpsPositions />
      </div>
    </div>
  )
}
