import React, { useMemo } from 'react'

import Card from 'components/common/Card'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import FundingRate from 'components/perps/PerpsInfo/FundingRate'
import InterestItem from 'components/perps/PerpsInfo/InterestItem'
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
        ? [
            <DisplayCurrency
              className='min-w-20'
              key='price'
              coin={BNCoin.fromDenomAndBigNumber('usd', assetPrice)}
            />,
          ]
        : [<Loading key='price' className='h-4 w-14' />]),
      <InfoItem
        key='openInterestLong'
        label='Open Interest (L)'
        item={<InterestItem type='long' />}
      />,
      <InfoItem
        key='openInterestShort'
        label='Open Interest (S)'
        item={<InterestItem type='short' />}
      />,
      <InfoItem key='fundingRate' label='Funding rate' item={<FundingRate />} />,
    ]
  }, [assetPrice, market])

  if (!market) return null

  return (
    <Card
      contentClassName='bg-white/10 py-3.5 px-4 overflow-x-scroll scrollbar-hide'
      className='order-1'
    >
      <div className='flex items-center gap-4'>
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
    <div className='flex flex-col gap-1 min-w-30'>
      <Text size='xs' className='text-white/40'>
        {props.label}
      </Text>
      {props.item}
    </div>
  )
}
