import { useMemo } from 'react'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAssets from 'hooks/assets/useAssets'
import useDepositedAstroLps from 'hooks/astroLp/useDepositedAstroLps'
import ActiveAstroLpsTable from './Table/ActiveAstroLpsTable'
import useActiveAstroLpsColumns from './Table/Columns/useActiveAstroLpsColumns'

export function ActiveAstroLps() {
  const { data: assets } = useAssets()
  const currentAccount = useCurrentAccount()
  const activeAstroLps = useDepositedAstroLps(currentAccount ? [currentAccount] : [])
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
