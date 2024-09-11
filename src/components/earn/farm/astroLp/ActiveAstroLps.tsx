import { useMemo } from 'react'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import ActiveAstroLpsTable from 'components/earn/farm/astroLp/Table/ActiveAstroLpsTable'
import useActiveAstroLpsColumns from 'components/earn/farm/astroLp/Table/Columns/useActiveAstroLpsColumns'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAssets from 'hooks/assets/useAssets'
import useDepositedAstroLps from 'hooks/astroLp/useDepositedAstroLps'

export function ActiveAstroLps() {
  const { data: assets } = useAssets()
  const account = useCurrentAccount()
  const activeAstroLps = useDepositedAstroLps(account ? [account] : [])
  const activeColumns = useActiveAstroLpsColumns(assets)

  const tabs: CardTab[] = useMemo(
    () => [
      {
        title: 'Active Astro LPs',
        renderContent: () => (
          <ActiveAstroLpsTable columns={activeColumns} data={activeAstroLps} isLoading={false} />
        ),
      },
    ],
    [activeColumns, activeAstroLps],
  )

  if (activeAstroLps?.length === 0) return null

  return <CardWithTabs tabs={tabs} />
}
