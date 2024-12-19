import { Row } from '@tanstack/react-table'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { demagnify } from 'utils/formatters'
import { BN } from 'utils/helpers'

export const BALANCE_META = { id: 'value', header: 'Balance', accessorKey: 'value' }

interface Props {
  row: Row<AssetTableRow>
}

export const valueSortingFn = (a: Row<AssetTableRow>, b: Row<AssetTableRow>): number => {
  const valueA = a.original.value ?? BN_ZERO
  const valueB = b.original.value ?? BN_ZERO
  return valueA.minus(valueB).toNumber()
}

export default function Balance(props: Props) {
  const { row } = props
  const asset = row.original.asset
  const balance = BN(row.original.balance ?? '0')
  const coin = BNCoin.fromDenomAndBigNumber(asset.denom, balance)

  return (
    <div className='flex flex-wrap items-center'>
      <DisplayCurrency coin={coin} className='mb-0.5 w-full text-white text-m' />
      <FormattedNumber
        className='w-full text-m text-white/60'
        options={{ minDecimals: 2, maxDecimals: asset.decimals }}
        amount={demagnify(balance, asset)}
      />
    </div>
  )
}
