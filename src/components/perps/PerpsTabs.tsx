import { PerpsChart } from './PerpsChart'
import { PerpsInfo } from './PerpsInfo'
import { Suspense, useMemo } from 'react'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import { PerpsStats } from './PerpsStats'

export function PerpsTabs() {
  const { perpsAsset } = usePerpsAsset()
  const tabs: CardTab[] = useMemo(
    () => [
      {
        title: 'Price Chart',
        id: 'chart',
        renderContent: () => <PerpsChart />,
      },
      {
        title: 'Market Stats',
        id: 'stats',
        renderContent: () => (
          <div className='flex flex-col gap-4 h-full'>
            <Suspense fallback={<div>Loading...</div>}>
              <PerpsStats denom={perpsAsset.denom} />
            </Suspense>
          </div>
        ),
      },
    ],
    [perpsAsset.denom],
  )

  return <CardWithTabs tabs={tabs} />
}
