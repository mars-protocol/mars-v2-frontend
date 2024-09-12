import { useMemo } from 'react'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import ActiveHlsFarmsTable from 'components/hls/Farm/Table/ActiveHlsFarmsTable'
import useActiveHlsFarmsColumns from 'components/hls/Farm/Table/Columns/useActiveHlsFarmsColumns'
import { EMPTY_ACCOUNT_HLS } from 'constants/accounts'
import useAccounts from 'hooks/accounts/useAccounts'
import useAssets from 'hooks/assets/useAssets'
import useDepositedAstroLpAccounts from 'hooks/astroLp/useDepositedAstroLpAccounts'
import useHlsFarms from 'hooks/hls/useHlsFarms'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountLeverage, getAccountNetValue } from 'utils/accounts'
import { BN } from 'utils/helpers'

export function ActiveHlsFarms() {
  const { data: assets } = useAssets()
  const address = useStore((s) => s.address)
  const { data: accounts } = useAccounts('high_levered_strategy', address)
  const { data: hlsFarms } = useHlsFarms()
  const depositedAstroLpAccounts = useDepositedAstroLpAccounts(accounts)
  const activeColumns = useActiveHlsFarmsColumns(assets)

  // MOCK DATA
  if (hlsFarms.length) {
    depositedAstroLpAccounts.push({
      account: {
        ...EMPTY_ACCOUNT_HLS,
        id: '770',
        debts: [
          BNCoin.fromDenomAndBigNumber(
            'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9',
            BN(160000000),
          ),
        ],
        stakedAstroLps: [
          BNCoin.fromDenomAndBigNumber(
            'factory/neutron1yem82r0wf837lfkwvcu2zxlyds5qrzwkz8alvmg0apyrjthk64gqeq2e98/astroport/share',
            BN(100000000),
          ),
        ],
      },
      astroLp: {
        ...hlsFarms[0].farm,
        amounts: { primary: BN(11000000), secondary: BN(10000000) },
        values: { primary: BN(407.12), secondary: BN(407.12) },
      },
    })
  }

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
