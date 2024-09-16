import { useMemo } from 'react'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import ActiveHlsFarmsTable from 'components/hls/Farm/Table/ActiveHlsFarmsTable'
import useActiveHlsFarmsColumns from 'components/hls/Farm/Table/Columns/useActiveHlsFarmsColumns'
import useAccounts from 'hooks/accounts/useAccounts'
import useAssets from 'hooks/assets/useAssets'
import useDepositedAstroLpAccounts from 'hooks/astroLp/useDepositedAstroLpAccounts'
import useHlsFarms from 'hooks/hls/useHlsFarms'
import useStore from 'store'
import { calculateAccountLeverage, getAccountNetValue } from 'utils/accounts'

export function ActiveHlsFarms() {
  const { data: assets } = useAssets()
  const address = useStore((s) => s.address)
  const { data: accounts } = useAccounts('high_levered_strategy', address)
  const { data: hlsFarms } = useHlsFarms()
  const depositedAstroLpAccounts = useDepositedAstroLpAccounts(accounts)
  const activeColumns = useActiveHlsFarmsColumns(assets)

  const activeHlsFarms = useMemo(() => {
    const depositedHlsFarms = [] as DepositedHlsFarm[]
    if (!hlsFarms || !depositedAstroLpAccounts) return []

    depositedAstroLpAccounts.forEach((depositedAstroLp) => {
      const hlsFarm = hlsFarms.find(
        (hlsFarm) => hlsFarm.farm.denoms.lp === depositedAstroLp.astroLp.denoms.lp,
      )
      if (!hlsFarm) return
      depositedHlsFarms.push({
        ...hlsFarm,
        farm: depositedAstroLp.astroLp,
        account: depositedAstroLp.account,
        netValue: getAccountNetValue(depositedAstroLp.account, assets),
        leverage: calculateAccountLeverage(depositedAstroLp.account, assets).toNumber(),
      })
    })
    return depositedHlsFarms
  }, [assets, depositedAstroLpAccounts, hlsFarms])

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
