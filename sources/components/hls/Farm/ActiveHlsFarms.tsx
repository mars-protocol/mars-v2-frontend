import { useMemo } from 'react'

import useAccounts from '../../../hooks/accounts/useAccounts'
import useAssets from '../../../hooks/assets/useAssets'
import useDepositedAstroLps from '../../../hooks/astroLp/useDepositedAstroLps'
import useStore from '../../../store'
import { CardWithTabs } from '../../common/Card/CardWithTabs'
import ActiveAstroLpsTable from '../../earn/farm/astroLp/Table/ActiveAstroLpsTable'
import useActiveHlsFarmsColumns from './Table/Columns/useActiveHlsFarmsColumns'

export function ActiveHlsFarms() {
  const { data: assets } = useAssets()
  const address = useStore((s) => s.address)
  const { data: accounts } = useAccounts('high_levered_strategy', address)
  const activeHlsFarms = useDepositedAstroLps(accounts)
  const activeColumns = useActiveHlsFarmsColumns(assets)

  console.log(accounts)
  const tabs: CardTab[] = useMemo(
    () => [
      {
        title: 'Active High Leverage Farms',
        renderContent: () => (
          <ActiveAstroLpsTable columns={activeColumns} data={activeHlsFarms} isLoading={false} />
        ),
      },
    ],
    [activeColumns, activeHlsFarms],
  )

  if (activeHlsFarms?.length === 0) return null

  return <CardWithTabs tabs={tabs} />
}
