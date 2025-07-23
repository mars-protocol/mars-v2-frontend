import { Row } from '@tanstack/react-table'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { BNCoin } from 'types/classes/BNCoin'
import { demagnify, getPerpsPriceDecimals } from 'utils/formatters'

export const SIZE_META = {
  id: 'size',
  accessorKey: 'size',
  header: () => (
    <div className='flex flex-col gap-1'>
      <Text size='xs'>Size</Text>
      <Text size='xs' className='text-white/40'>
        Value
      </Text>
    </div>
  ),
  meta: {
    className: 'min-w-20 lg:w-40',
  },
}

export const sizeSortingFn = (a: Row<PerpPositionRow>, b: Row<PerpPositionRow>): number => {
  return a.original.amount.abs().minus(b.original.amount.abs()).toNumber()
}

type Props = {
  amount: BigNumber
  asset: Asset
  value: BigNumber
  type: string
  options?: { abbreviated?: boolean }
}

export default function Size(props: Props) {
  const { amount, value, asset, options } = props

  const scaledValue =
    props.type === 'limit' || props.type === 'stop'
      ? value.shiftedBy(asset.decimals - PRICE_ORACLE_DECIMALS)
      : value

  return (
    <TitleAndSubCell
      title={
        <FormattedNumber
          amount={Math.abs(Number(demagnify(amount, asset)))}
          options={{
            maxDecimals: props.asset.decimals,
            abbreviated: options?.abbreviated,
          }}
          className='text-xs'
        />
      }
      sub={
        <DisplayCurrency
          coin={BNCoin.fromDenomAndBigNumber('usd', scaledValue)}
          options={{
            maxDecimals: getPerpsPriceDecimals(value),
            minDecimals: 0,
            abbreviated: options?.abbreviated,
          }}
        />
      }
    />
  )
}
