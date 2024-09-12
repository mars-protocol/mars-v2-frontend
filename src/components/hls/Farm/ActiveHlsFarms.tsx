import { useMemo } from 'react'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import useActiveHlsFarmsColumns from 'components/hls/Farm/Table/Columns/useActiveHlsFarmsColumns'
import useAccounts from 'hooks/accounts/useAccounts'
import useAssets from 'hooks/assets/useAssets'
import useDepositedAstroLps from 'hooks/astroLp/useDepositedAstroLps'
import useHlsFarms from 'hooks/hls/useHlsFarms'
import useStore from 'store'
import ActiveHlsFarmsTable from './Table/ActiveHlsFarmsTable'

export function ActiveHlsFarms() {
  const { data: assets } = useAssets()
  const address = useStore((s) => s.address)
  const { data: accounts } = useAccounts('high_levered_strategy', address)
  const { data: hlsFarms } = useHlsFarms()
  const activeAstroLps = useDepositedAstroLps(accounts)
  const activeColumns = useActiveHlsFarmsColumns(assets)

  const activeHlsFarms = useMemo(() => {
    const depositedHlsFarms = [] as DepositedHlsFarm[]
    if (!hlsFarms || !activeAstroLps) return []

    activeAstroLps.forEach((activeAstroLp) => {
      const hlsFarm = hlsFarms.find((hlsFarm) => hlsFarm.farm.denoms.lp === activeAstroLp.denoms.lp)
      if (!hlsFarm) return
      depositedHlsFarms.push({
        ...hlsFarm,
        farm: activeAstroLp,
      })
    })
    return depositedHlsFarms
  }, [activeAstroLps, hlsFarms])

  const tabs: CardTab[] = useMemo(
    () => [
      {
        title: 'Active High Leverage Farms',
        renderContent: () => (
          <ActiveHlsFarmsTable columns={activeColumns} data={activeHlsFarms} isLoading={false} />
        ),
      },
    ],
    [activeColumns, activeHlsFarms],
  )

  if (activeHlsFarms?.length === 0) return null

  return <CardWithTabs tabs={tabs} />
}
