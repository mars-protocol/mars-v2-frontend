import { Row } from '@tanstack/react-table'

import { FormattedNumber } from 'components/common/FormattedNumber'

export const LEV_META = { accessorKey: 'leverage ', header: 'Leverage' }

interface Props {
  account: HlsAccountWithStrategy
}

export function leverageSortingFn(a: Row<HlsAccountWithStrategy>, b: Row<HlsAccountWithStrategy>) {
  return a.original.leverage - b.original.leverage
}

export default function Leverage(props: Props) {
  return (
    <FormattedNumber
      amount={props.account.leverage}
      options={{ minDecimals: 2, maxDecimals: 2, suffix: 'x' }}
      className='text-xs'
      animate
    />
  )
}
