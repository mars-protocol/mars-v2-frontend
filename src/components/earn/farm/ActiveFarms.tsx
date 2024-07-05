import { useMemo } from 'react'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import ActiveFarmsTable from 'components/earn/farm/Table/ActiveFarmsTable'
import useActiveFarmsColumns from 'components/earn/farm/Table/Columns/useActiveFarmsColumns'
import useDepositedFarms from 'hooks/farms/useDepositedFarms'
export function ActiveFarms() {
  const activeFarms = useDepositedFarms()
  const activeColumns = useActiveFarmsColumns()

  const tabs: CardTab[] = useMemo(
    () => [
      {
        title: 'Active Farms',
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
