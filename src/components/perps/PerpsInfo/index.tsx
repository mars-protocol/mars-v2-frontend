import React, { useMemo } from 'react'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import Text from 'components/common/Text'
import FundingRate from 'components/perps/PerpsInfo/FundingRate'
import usePerpsMarket from 'hooks/perps/usePerpsMarket'
import { BNCoin } from 'types/classes/BNCoin'
import Skew from 'components/perps/PerpsInfo/Skew'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { getPerpsPriceDecimals } from 'utils/formatters'

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
      <InfoItem key='skew' label='Skew' item={<Skew />} />,
      <InfoItem key='fundingRate' label='Funding rate' item={<FundingRate />} />,
      <InfoItem
        key='price'
        label='Price'
        item={
          <div className='flex items-center gap-1 text-sm md:hidden'>
            <Text size='sm'>1 {market.asset.symbol}</Text>
            <FormattedNumber
              className='text-sm'
              amount={Number(market.asset.price?.amount ?? 0)}
              options={{
                prefix: '= ',
                suffix: ` USD`,
                abbreviated: false,
                maxDecimals: getPerpsPriceDecimals(market.asset.price?.amount),
              }}
            />
          </div>
        }
      />,
    ]
  }, [market])

  if (!market) return null

  return (
    <div className='flex flex-wrap items-center gap-2 md:gap-4 mb-2 sm:mb-0'>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item}
          {index !== items.length - 1 && (
            <Divider orientation='vertical' className='hidden md:block h-9' />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

interface InfoItemProps {
  item: React.ReactNode
  label: string
  className?: string
}

function InfoItem(props: InfoItemProps) {
  return (
    <div className={`flex flex-col gap-1 min-w-30 ${props.className || ''}`}>
      <Text size='xs' className='text-white/40'>
        {props.label}
      </Text>
      {props.item}
    </div>
  )
}
