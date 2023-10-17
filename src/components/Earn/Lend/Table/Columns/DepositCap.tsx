import React from 'react'

import { FormattedNumber } from 'components/FormattedNumber'
import TitleAndSubCell from 'components/TitleAndSubCell'

export const DEPOSIT_CAP_META = { accessorKey: 'marketDepositCap', header: 'Depo. Cap' }

interface Props {
  data: LendingMarketTableData
}
export default function DepositCap(props: Props) {
  const { marketDepositCap, marketDepositAmount, asset } = props.data
  const percent = marketDepositAmount.dividedBy(marketDepositCap).multipliedBy(100)

  return (
    <TitleAndSubCell
      className='text-xs'
      title={
        <FormattedNumber
          amount={marketDepositCap.toNumber()}
          options={{ abbreviated: true, decimals: asset.decimals }}
          animate
        />
      }
      sub={
        <FormattedNumber
          amount={percent.toNumber()}
          options={{ minDecimals: 2, maxDecimals: 2, suffix: '% used' }}
          animate
        />
      }
    />
  )
}
