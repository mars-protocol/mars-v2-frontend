import { useMemo } from 'react'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import AvailableHlsFarmsTable from 'components/hls/Farm/Table/AvailableHlsFarmsTable'

export function AvailableHlsFarms() {
  const tabs: CardTab[] = useMemo(
    () => [
      {
        title: 'Available High Leverage Farms',
        renderContent: () => <AvailableHlsFarmsTable />,
      },
    ],
    [],
  )

  return <CardWithTabs tabs={tabs} />
}
