import { Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import { BNCoin } from '../../../../types/classes/BNCoin'
import { demagnify } from '../../../../utils/formatters'
import DisplayCurrency from '../../../common/DisplayCurrency'
import { FormattedNumber } from '../../../common/FormattedNumber'
import Text from '../../../common/Text'
import TitleAndSubCell from '../../../common/TitleAndSubCell'

export const SIZE_META = {
  accessorKey: 'size',
  header: () => (
    <div className='flex flex-col gap-1'>
      <Text size='xs'>Size</Text>
      <Text size='xs' className='text-white/40'>
        Value
      </Text>
    </div>
  ),
}

export const sizeSortingFn = (a: Row<PerpPositionRow>, b: Row<PerpPositionRow>): number => {
  return a.original.amount.abs().minus(b.original.amount.abs()).toNumber()
}

type Props = {
  amount: BigNumber
  asset: Asset
}

export default function Size(props: Props) {
  const amount = useMemo(
    () => demagnify(props.amount.abs().toString(), props.asset),
    [props.asset, props.amount],
  )

  return (
    <TitleAndSubCell
      title={
        <FormattedNumber
          amount={amount}
          options={{ maxDecimals: amount < 0.0001 ? props.asset.decimals : 4 }}
          className='text-xs'
        />
      }
      sub={
        <DisplayCurrency
          coin={BNCoin.fromDenomAndBigNumber(props.asset.denom, props.amount.abs())}
        />
      }
    />
  )
}
