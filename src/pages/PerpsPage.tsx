import { PerpsModule } from 'components/Perps/Module/PerpsModule'
import { PerpsChart } from 'components/Perps/PerpsChart'
import { PerpsInfo } from 'components/Perps/PerpsInfo'
import { PerpsPositions } from 'components/Perps/PerpsPositions'

export default function PerpsPage() {
  return (
    <div className='flex flex-col w-full h-full gap-4'>
      <div className='grid w-full grid-cols-[auto_346px] gap-4 pb-4'>
        <div className='grid grid-cols-1 grid-rows-[min-content_auto_min-content] gap-4 h-[calc(100vh-93px)] pb-4'>
          <PerpsInfo />
          <PerpsChart />
          <PerpsPositions />
        </div>
        <PerpsModule />
      </div>
    </div>
  )
}
