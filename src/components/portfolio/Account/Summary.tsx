import { Suspense, useMemo } from 'react'

import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import Skeleton from 'components/portfolio/SummarySkeleton'
import { MAX_AMOUNT_DECIMALS } from 'constants/math'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useAstroLpAprs from 'hooks/astroLp/useAstroLpAprs'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
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
  const assets = useWhitelistedAssets()
  const astroLpAprs = useAstroLpAprs()

  const stats = useMemo(() => {
    if (!account || !borrowAssets.length || !lendingAssets.length) return DEFAULT_PORTFOLIO_STATS

    const { positionValue, debts, netWorth, apy, leverage } = getAccountSummaryStats(
      account,
      borrowAssets,
      lendingAssets,
      assets,
      vaultAprs,
      astroLpAprs,
    )

    return [
      {
        title: <DisplayCurrency className='text-xl' coin={positionValue} />,
        sub: DEFAULT_PORTFOLIO_STATS[0].sub,
      },
      {
        title: <DisplayCurrency className='text-xl' coin={debts} />,
        sub: DEFAULT_PORTFOLIO_STATS[1].sub,
      },
      {
        title: <DisplayCurrency className='text-xl' coin={netWorth} />,
        sub: DEFAULT_PORTFOLIO_STATS[2].sub,
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
        sub: DEFAULT_PORTFOLIO_STATS[3].sub,
      },
      {
        title: (
          <FormattedNumber
            className='text-xl'
            amount={leverage.toNumber() || 1}
            options={{ suffix: 'x' }}
          />
        ),
        sub: props.v1 ? 'Total Leverage' : DEFAULT_PORTFOLIO_STATS[4].sub,
      },
    ]
  }, [account, assets, borrowAssets, lendingAssets, vaultAprs, props.v1, astroLpAprs])

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
