import React, { Suspense, useMemo } from 'react'

import HealthBar from 'components/Account/HealthBar'
import Card from 'components/Card'
import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { Heart } from 'components/Icons'
import Loading from 'components/Loading'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { ORACLE_DENOM } from 'constants/oracle'
import useAccount from 'hooks/useAccount'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useHealthComputer from 'hooks/useHealthComputer'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import {
  calculateAccountApr,
  calculateAccountLeverage,
  getAccountPositionValues,
} from 'utils/accounts'

interface Props {
  accountId: string
}

function Content(props: Props) {
  const { data: account } = useAccount(props.accountId, true)
  const { data: prices } = usePrices()
  const { health } = useHealthComputer(account)
  const { availableAssets: borrowAvailableAssets, accountBorrowedAssets } =
    useBorrowMarketAssetsTableData()
  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()

  const stats = useMemo(() => {
    if (!account || !borrowAvailableAssets.length || !lendingAvailableAssets.length) return STATS

    const [deposits, lends, debts, vaults] = getAccountPositionValues(account, prices)
    const positionValue = deposits.plus(lends).plus(debts).plus(vaults)
    const apr = calculateAccountApr(account, borrowAvailableAssets, lendingAvailableAssets, prices)
    const leverage = calculateAccountLeverage(account, prices)
    return [
      {
        title: (
          <DisplayCurrency
            className='text-xl'
            coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, positionValue)}
          />
        ),
        sub: STATS[0].sub,
      },
      {
        title: (
          <DisplayCurrency
            className='text-xl'
            coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, debts)}
          />
        ),
        sub: STATS[1].sub,
      },
      {
        title: (
          <FormattedNumber className='text-xl' amount={apr.toNumber()} options={{ suffix: '%' }} />
        ),
        sub: STATS[2].sub,
      },
      {
        title: (
          <FormattedNumber
            className='text-xl'
            amount={deposits.toNumber()}
            options={{ suffix: '%' }}
          />
        ),
        sub: STATS[3].sub,
      },
      {
        title: (
          <FormattedNumber
            className='text-xl'
            amount={leverage.toNumber()}
            options={{ suffix: 'x' }}
          />
        ),
        sub: STATS[4].sub,
      },
    ]
  }, [account, borrowAvailableAssets, lendingAvailableAssets, prices])

  return <Skeleton stats={stats} health={health} {...props} />
}

export default function Summary(props: Props) {
  return (
    <Suspense fallback={<Skeleton stats={STATS} health={0} {...props} />}>
      <Content {...props} />
    </Suspense>
  )
}

interface SkeletonProps extends Props {
  stats: { title: React.ReactNode | null; sub: string }[]
  health: number
}

function Skeleton(props: SkeletonProps) {
  return (
    <div className='flex flex-col py-8 gap-8'>
      <div className='flex justify-between'>
        <Text size='2xl'>Credit Account {props.accountId}</Text>
        <div className='flex gap-1 max-w-[300px] flex-grow'>
          <Heart width={20} />
          <HealthBar health={props.health} className='h-full' />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3'>
        {props.stats.map((stat) => (
          <Card key={stat.sub} className='p-6 bg-white/5 flex-grow-1 text-center'>
            <TitleAndSubCell
              title={stat.title || <Loading className='w-20 h-6 mx-auto mb-2' />}
              sub={stat.sub}
              className='mb-1'
            />
          </Card>
        ))}
      </div>
    </div>
  )
}

const STATS = [
  { title: null, sub: 'Total Pos.Value' },
  { title: null, sub: 'Liabilities' },
  { title: null, sub: 'APR' },
  { title: null, sub: 'Borrow Rate' },
  { title: null, sub: 'Account Leverage' },
]
