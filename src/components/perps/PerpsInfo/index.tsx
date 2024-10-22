import React, { useMemo } from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import Text from 'components/common/Text'
import FundingRate from 'components/perps/PerpsInfo/FundingRate'
import usePerpsMarket from 'hooks/perps/usePerpsMarket'
import { BNCoin } from 'types/classes/BNCoin'

export function PerpsInfo() {
  const market = usePerpsMarket()

  const items = useMemo(() => {
    if (!market) return []

    return [
      <InfoItem
        key='openInterestLong'
        label='Open Interest (L)'
        item={
          <DisplayCurrency
            className='text-sm'
            coin={BNCoin.fromDenomAndBigNumber(market.asset.denom, market.openInterest.long)}
          />
        }
      />,
      <InfoItem
        key='openInterestShort'
        label='Open Interest (S)'
        item={
          <DisplayCurrency
            className='text-sm'
            coin={BNCoin.fromDenomAndBigNumber(market.asset.denom, market.openInterest.short)}
          />
        }
      />,
      <InfoItem key='fundingRate' label='Funding rate' item={<FundingRate />} />,
    ]
  }, [market])

  if (!market) return null

  return (
    <div className='flex items-center md:gap-4 mb-2 sm:mb-0'>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item}
          {index !== items.length - 1 && <Divider orientation='vertical' className='h-9' />}
        </React.Fragment>
      ))}
    </div>
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
