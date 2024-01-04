import React, { useMemo } from 'react'

import AssetSymbol from 'components/Asset/AssetSymbol'
import Card from 'components/Card'
import DisplayCurrency from 'components/DisplayCurrency'
import Divider from 'components/Divider'
import { FormattedNumber } from 'components/FormattedNumber'
import Loading from 'components/Loading'
import Text from 'components/Text'
import usePerpsMarket from 'hooks/perps/usePerpsMarket'
import usePrice from 'hooks/usePrice'
import { BNCoin } from 'types/classes/BNCoin'

export function PerpsInfo() {
  const { data: market } = usePerpsMarket()
  const assetPrice = usePrice(market?.asset.denom || '')

  const items = useMemo(() => {
    if (!market) return []

    return [
      ...(!assetPrice.isZero()
        ? [<DisplayCurrency key='price' coin={BNCoin.fromDenomAndBigNumber('usd', assetPrice)} />]
        : [<Loading key='price' className='w-14 h-4' />]),
      <InfoItem
        key='openInterestLong'
        label='Open Interest (L)'
        item={<InterestItem market={market} type='long' />}
      />,
      <InfoItem
        key='openInterestShort'
        label='Open Interest (S)'
        item={<InterestItem market={market} type='short' />}
      />,
      <InfoItem
        key='fundingRate'
        label='Funding rate'
        item={
          market ? (
            <FormattedNumber
              className='text-sm inline'
              amount={market.fundingRate.toNumber()}
              options={{ minDecimals: 6, maxDecimals: 6, suffix: '%' }}
            />
          ) : (
            <Loading />
          )
        }
      />,
    ]
  }, [assetPrice, market])

  return (
    <Card contentClassName='bg-white/10 py-3.5 px-4'>
      <div className='flex gap-4 items-center'>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item}
            {index !== items.length - 1 && <Divider orientation='vertical' className='h-9' />}
          </React.Fragment>
        ))}
      </div>
    </Card>
  )
}

interface InfoItemProps {
  item: React.ReactNode
  label: string
}

function InfoItem(props: InfoItemProps) {
  return (
    <div className='flex flex-col gap-1'>
      <Text size='xs' className='text-white/40'>
        {props.label}
      </Text>
      {props.item}
    </div>
  )
}

interface InterestItemProps {
  market: PerpsMarket | null
  type: 'long' | 'short'
}
function InterestItem(props: InterestItemProps) {
  if (!props.market) return <Loading />

  return (
    <div className='flex gap-1 items-center'>
      <FormattedNumber
        className='text-sm inline'
        amount={props.market.openInterest[props.type].toNumber()}
        options={{ decimals: props.market.asset.decimals }}
      />
      <AssetSymbol symbol={props.market.asset.symbol} />
    </div>
  )
}
