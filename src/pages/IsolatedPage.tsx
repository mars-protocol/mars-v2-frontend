import { PerpsModule } from 'components/perps/Module/PerpsModule'
import PerpsBanner from 'components/perps/PerpsBanner'
import { PerpsPositions } from 'components/perps/PerpsPositions'
import { PerpsTabs } from 'components/perps/PerpsTabs'

export default function IsolatedPage() {
  return (
    <div className='flex flex-wrap w-full gap-4 md:grid md:grid-cols-chart'>
      <div className='w-full'>
        <PerpsBanner />
        <PerpsTabs />
      </div>
      <div className='w-full row-span-2'>
        <PerpsModule />
      </div>
      <PerpsPositions />
    </div>
  )
}
