import { useMemo } from 'react'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import ActiveFarmsTable from 'components/earn/farm/Table/ActiveFarmsTable'
import useActiveFarmsColumns from 'components/earn/farm/Table/Columns/useActiveFarmsColumns'
import useDepositedFarms from 'hooks/farms/useDepositedFarms'
import useAssets from 'hooks/assets/useAssets'
export function ActiveFarms() {
  const { data: assets } = useAssets()
  const activeFarms = useDepositedFarms()
  const activeColumns = useActiveFarmsColumns(assets)

  const tabs: CardTab[] = useMemo(
    () => [
      {
        title: 'Active LP Farms',
        renderContent: () => (
          <ActiveFarmsTable columns={activeColumns} data={activeFarms} isLoading={false} />
        ),
      },
    ],
    [activeColumns, activeFarms],
  )

  if (activeFarms?.length === 0) return null

  return <CardWithTabs tabs={tabs} />
}
