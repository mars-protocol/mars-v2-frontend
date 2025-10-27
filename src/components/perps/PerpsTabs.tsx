import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import { PerpsChart } from 'components/perps/PerpsChart'
import { PerpsInfo } from 'components/perps/PerpsInfo'
import { PerpsStats } from 'components/perps/PerpsStats'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import { Suspense, useMemo } from 'react'

export function PerpsTabs() {
  const { perpsAsset } = usePerpsAsset()
  const tabs: CardTab[] = useMemo(
    () => [
      {
        title: 'Trading Chart',
        id: 'chart',
        renderContent: () => <PerpsChart />,
      },
      {
        title: 'Market Stats',
        id: 'stats',
        renderContent: () => (
          <>
            <div className='flex flex-wrap items-center justify-between w-full p-4'>
              <PerpsInfo />
            </div>
            <div className='flex flex-col h-full gap-4'>
              <Suspense fallback={<div>Loading...</div>}>
                <PerpsStats denom={perpsAsset.denom} />
              </Suspense>
            </div>
          </>
        ),
      },
    ],
    [perpsAsset.denom],
  )

  return <CardWithTabs tabs={tabs} />
}
