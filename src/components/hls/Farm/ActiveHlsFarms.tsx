import { useMemo } from 'react'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import ActiveAstroLpsTable from 'components/earn/farm/astroLp/Table/ActiveAstroLpsTable'
import useActiveHlsFarmsColumns from 'components/hls/Farm/Table/Columns/useActiveHlsFarmsColumns'
import useAccounts from 'hooks/accounts/useAccounts'
import useAssets from 'hooks/assets/useAssets'
import useDepositedAstroLps from 'hooks/astroLp/useDepositedAstroLps'
import useStore from 'store'

export function ActiveHlsFarms() {
  const { data: assets } = useAssets()
  const address = useStore((s) => s.address)
  const { data: accounts } = useAccounts('high_levered_strategy', address)
  const activeHlsFarms = useDepositedAstroLps(accounts)
  const activeColumns = useActiveHlsFarmsColumns(assets)

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
