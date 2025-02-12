import { Suspense, useMemo } from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Skeleton from 'components/portfolio/SummarySkeleton'
import { MAX_AMOUNT_DECIMALS } from 'constants/math'
import useAssets from 'hooks/assets/useAssets'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import { DEFAULT_PORTFOLIO_STATS } from 'utils/constants'
import { Tooltip } from 'components/common/Tooltip'
import classNames from 'classnames'
import { useAccountSummaryStats } from 'hooks/accounts/useAccountSummaryStats'

interface Props {
  account: Account
  v1?: boolean
}

function Content(props: Props) {
  const { account } = props
  const { health, healthFactor } = useHealthComputer(account)
  const { data: assets } = useAssets()

  const hasLstApy = useMemo(() => {
    return account?.deposits?.some((deposit) => {
      const asset = assets?.find((asset) => asset.denom === deposit.denom)
      return asset?.campaigns?.some((campaign) => campaign.type === 'apy')
    })
  }, [account, assets])

  const { positionValue, collateralValue, debts, netWorth, apy, leverage } =
    useAccountSummaryStats(account)

  const stats = useMemo(() => {
    if (!account) return DEFAULT_PORTFOLIO_STATS

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
          <Tooltip
            type='info'
            content={
              hasLstApy ? 'Includes underlying staking APY from Liquid Staking Tokens' : undefined
            }
          >
            <div className='flex w-full justify-center'>
              <div
                className={classNames(
                  'text-xl',
                  hasLstApy && 'border-b border-dashed border-white/40 cursor-help w-fit',
                )}
              >
                <FormattedNumber
                  className='text-xl'
                  amount={apy.toNumber()}
                  options={{
                    suffix: '%',
                    maxDecimals: apy.abs().isLessThan(0.1) ? MAX_AMOUNT_DECIMALS : 2,
                    minDecimals: 2,
                  }}
                />
              </div>
            </div>
          </Tooltip>
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
  }, [account, apy, collateralValue, debts, leverage, hasLstApy, positionValue, props.v1, netWorth])

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
