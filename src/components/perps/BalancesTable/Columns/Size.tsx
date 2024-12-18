import { Row } from '@tanstack/react-table'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
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
  options?: { abbreviated?: boolean }
}

export default function Size(props: Props) {
  const { amount, value, asset, options } = props

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
          coin={BNCoin.fromDenomAndBigNumber('usd', value)}
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
