import { useMemo } from 'react'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import ActiveAstroLpsTable from 'components/earn/farm/astroLp/Table/ActiveAstroLpsTable'
import useActiveAstroLpsColumns from 'components/earn/farm/astroLp/Table/Columns/useActiveAstroLpsColumns'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAssets from 'hooks/assets/useAssets'
import useDepositedAstroLpAccounts from 'hooks/astroLp/useDepositedAstroLpAccounts'

export function ActiveAstroLps() {
  const { data: assets } = useAssets()
  const account = useCurrentAccount()
  const depositedAstroLpAccounts = useDepositedAstroLpAccounts(account ? [account] : [])
  const activeColumns = useActiveAstroLpsColumns(assets)
  const activeAstroLps = useMemo(
    () => depositedAstroLpAccounts.map((account) => account.astroLp),
    [depositedAstroLpAccounts],
  )

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
