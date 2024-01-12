import React from 'react'

import AssetSymbol from 'components/Asset/AssetSymbol'
import { FormattedNumber } from 'components/FormattedNumber'
import Loading from 'components/Loading'
import usePerpsMarket from 'hooks/perps/usePerpsMarket'

interface InterestItemProps {
  type: 'long' | 'short'
}
export default function InterestItem(props: InterestItemProps) {
  const { data: market, isLoading } = usePerpsMarket()

  if (isLoading) return <Loading />
  if (!market) return null

  return (
    <div className='flex gap-1 items-center'>
      <FormattedNumber
        className='text-sm inline'
        amount={market.openInterest[props.type].toNumber()}
        options={{ decimals: market.asset.decimals }}
      />
      <AssetSymbol symbol={market.asset.symbol} />
    </div>
  )
}
