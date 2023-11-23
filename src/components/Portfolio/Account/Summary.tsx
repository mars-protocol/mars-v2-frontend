import { Suspense, useMemo } from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import Skeleton from 'components/Portfolio/SummarySkeleton'
import { MAX_AMOUNT_DECIMALS } from 'constants/math'
import useAccount from 'hooks/useAccount'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useHealthComputer from 'hooks/useHealthComputer'
import useHLSStakingAssets from 'hooks/useHLSStakingAssets'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import usePrices from 'hooks/usePrices'
import { getAccountSummaryStats } from 'utils/accounts'
import { DEFAULT_PORTFOLIO_STATS } from 'utils/constants'

interface Props {
  accountId: string
}

function Content(props: Props) {
  const { data: account } = useAccount(props.accountId, true)
  const { data: prices } = usePrices()
  const { health, healthFactor } = useHealthComputer(account)
  const { data } = useBorrowMarketAssetsTableData(false)
  const borrowAssets = useMemo(() => data?.allAssets || [], [data])
  const { allAssets: lendingAssets } = useLendingMarketAssetsTableData()
  const { data: hlsStrategies } = useHLSStakingAssets()

  const stats = useMemo(() => {
    if (!account || !borrowAssets.length || !lendingAssets.length) return DEFAULT_PORTFOLIO_STATS

    const { positionValue, debts, netWorth, apr, leverage } = getAccountSummaryStats(
      account,
      prices,
      borrowAssets,
      lendingAssets,
      hlsStrategies,
      account.kind === 'high_levered_strategy',
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
            amount={apr.toNumber()}
            options={{
              suffix: '%',
              maxDecimals: apr.abs().isLessThan(0.1) ? MAX_AMOUNT_DECIMALS : 2,
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
            amount={leverage.toNumber()}
            options={{ suffix: 'x' }}
          />
        ),
        sub: DEFAULT_PORTFOLIO_STATS[4].sub,
      },
    ]
  }, [account, borrowAssets, hlsStrategies, lendingAssets, prices])

  return (
    <Skeleton
      stats={stats}
      health={health}
      healthFactor={healthFactor}
      title={`Credit Account ${props.accountId}`}
      accountId={props.accountId}
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
          title={`Credit Account ${props.accountId}`}
          accountId={props.accountId}
        />
      }
    >
      <Content {...props} />
    </Suspense>
  )
}
