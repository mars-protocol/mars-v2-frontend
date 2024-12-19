import { Row } from '@tanstack/react-table'
import classNames from 'classnames'
import DisplayCurrency from 'components/common/DisplayCurrency'

import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { demagnify } from 'utils/formatters'

export const DEPOSIT_CAP_META = {
  accessorKey: 'marketDepositCap',
  header: 'Deposit Cap',
  id: 'marketDepositCap',
  meta: {
    className: 'w-40 min-w-30',
  },
}

export const marketDepositCapSortingFn = (
  a: Row<LendingMarketTableData>,
  b: Row<LendingMarketTableData>,
): number => {
  const assetA = a.original.asset
  const assetB = b.original.asset
  if (!a.original.cap || !b.original.cap) return 0
  if (!a.original.cap.max || !b.original.cap.max) return 0

  const marketDepositCapA = demagnify(a.original.cap.max, assetA)
  const marketDepositCapB = demagnify(b.original.cap.max, assetB)
  return marketDepositCapA - marketDepositCapB
}

interface Props {
  isLoading: boolean
  data: LendingMarketTableData
}
export default function DepositCap(props: Props) {
  if (props.isLoading) return <Loading />
  const { cap } = props.data
  const percent = cap ? cap.used.dividedBy(cap.max).multipliedBy(100) : BN_ZERO
  const depositCapUsed = Math.min(percent.toNumber(), 100)

  return (
    <TitleAndSubCell
      className='text-xs'
      title={
        <DisplayCurrency
          coin={BNCoin.fromDenomAndBigNumber(cap?.denom ?? '', cap?.max ?? BN_ZERO)}
          className='text-xs'
        />
      }
      sub={
        <FormattedNumber
          amount={depositCapUsed}
          options={{ minDecimals: 2, maxDecimals: 2, suffix: '% used' }}
          className={classNames(
            depositCapUsed >= 100 ? 'text-loss/60' : depositCapUsed > 90 ? 'text-info/60' : '',
          )}
        />
      }
    />
  )
}
