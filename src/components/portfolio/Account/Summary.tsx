import { Suspense, useMemo } from 'react'

import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import Skeleton from 'components/portfolio/SummarySkeleton'
import { MAX_AMOUNT_DECIMALS } from 'constants/math'
import useAssets from 'hooks/assets/useAssets'
import useAstroLpAprs from 'hooks/astroLp/useAstroLpAprs'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useAssetParams from 'hooks/params/useAssetParams'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import { getAccountSummaryStats } from 'utils/accounts'
import { DEFAULT_PORTFOLIO_STATS } from 'utils/constants'

interface Props {
  account: Account
  v1?: boolean
}

function Content(props: Props) {
  const { account } = props
  const { data: vaultAprs } = useVaultAprs()
  const { health, healthFactor } = useHealthComputer(account)
  const data = useBorrowMarketAssetsTableData()
  const borrowAssets = useMemo(() => data?.allAssets || [], [data])
  const { allAssets: lendingAssets } = useLendingMarketAssetsTableData()
  const { data: assets } = useAssets()
  const { data: perpsVault } = usePerpsVault()
  const astroLpAprs = useAstroLpAprs()
  const assetParams = useAssetParams()

  const stats = useMemo(() => {
    if (!account || !borrowAssets.length || !lendingAssets.length) return DEFAULT_PORTFOLIO_STATS
    const { positionValue, collateralValue, debts, netWorth, apy, leverage } =
      getAccountSummaryStats(
        account,
        borrowAssets,
        lendingAssets,
        assets,
        vaultAprs,
        astroLpAprs,
        assetParams.data || [],
        perpsVault?.apy || 0,
      )

    return [
      {
        title: <DisplayCurrency className='text-xl' coin={positionValue} />,
        sub: DEFAULT_PORTFOLIO_STATS[0].sub,
      },
      {
        title: <DisplayCurrency className='text-xl' coin={collateralValue} />,
        sub: DEFAULT_PORTFOLIO_STATS[1].sub,
      },
      {
        title: <DisplayCurrency className='text-xl' coin={debts} />,
        sub: DEFAULT_PORTFOLIO_STATS[2].sub,
      },
      {
        title: <DisplayCurrency className='text-xl' coin={netWorth} />,
        sub: DEFAULT_PORTFOLIO_STATS[3].sub,
      },
      {
        title: (
          <FormattedNumber
            className='text-xl'
            amount={apy.toNumber()}
            options={{
              suffix: '%',
              maxDecimals: apy.abs().isLessThan(0.1) ? MAX_AMOUNT_DECIMALS : 2,
              minDecimals: 2,
            }}
          />
        ),
        sub: DEFAULT_PORTFOLIO_STATS[4].sub,
      },
      {
        title: (
          <FormattedNumber
            className='text-xl'
            amount={leverage.toNumber() || 1}
            options={{ suffix: 'x' }}
          />
        ),
        sub: props.v1 ? 'Total Leverage' : DEFAULT_PORTFOLIO_STATS[5].sub,
      },
    ]
  }, [
    account,
    borrowAssets,
    lendingAssets,
    assets,
    vaultAprs,
    astroLpAprs,
    assetParams.data,
    perpsVault?.apy,
    props.v1,
  ])

  return (
    <Skeleton
      stats={stats}
      health={health}
      healthFactor={healthFactor}
      title={props.v1 ? 'V1 Portfolio' : `Credit Account ${account.id}`}
      accountId={account.id}
    />
  )
}

export default function Summary(props: Props) {
  return (
    <Suspense
      fallback={
        <Skeleton
          health={0}
          healthFactor={0}
          title={`Credit Account ${props.account.id}`}
          accountId={props.account.id}
        />
      }
    >
      <Content {...props} />
    </Suspense>
  )
}
