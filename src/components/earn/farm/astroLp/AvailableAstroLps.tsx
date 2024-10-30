import { useMemo } from 'react'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import AvailableAstroLpsTable from 'components/earn/farm/astroLp/Table/AvailableAstroLpsTable'
import useChainConfig from 'hooks/chain/useChainConfig'

export function AvailableAstroLps() {
  const chainConfig = useChainConfig()

  const tabs: CardTab[] = useMemo(
    () => [
      ...(chainConfig.farm
        ? [
            {
              title: 'Available Astro LPs',
              renderContent: () => <AvailableAstroLpsTable />,
            },
          ]
        : []),
    ],
    [chainConfig.farm],
  )

  return <CardWithTabs tabs={tabs} />
}
