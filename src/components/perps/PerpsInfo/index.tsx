import classNames from 'classnames'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import FundingRate from 'components/perps/PerpsInfo/FundingRate'
import Skew from 'components/perps/PerpsInfo/Skew'
import TotalOpenInterest from 'components/perps/PerpsInfo/TotalOpenInterest'
import usePerpsMarket from 'hooks/perps/usePerpsMarket'
import React, { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
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
      <InfoItem key='totalOpenInterest' label='Total Open Interest' item={<TotalOpenInterest />} />,
      <InfoItem key='skew' label='Skew' item={<Skew />} />,
      <InfoItem key='fundingRate' label='Funding rate' item={<FundingRate />} />,
      <InfoItem
        key='price'
        label='Price'
        className='md:hidden'
        item={
          <div className='flex items-center gap-1 text-sm'>
            <Text size='sm'>1 {market.asset.symbol}</Text>
            <FormattedNumber
              className='text-sm'
              amount={Number(market.asset.price?.amount ?? 0)}
              options={{
                prefix: '= $',
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
    <div className='flex flex-wrap items-center justify-between gap-2 mb-2 md:gap-4 sm:mb-0'>
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
    <div
      className={classNames(
        'flex flex-col gap-1 w-[calc(50%-0.25rem)] md:w-auto md:min-w-30',
        props.className,
      )}
    >
      <Text size='xs' className='text-white/40'>
        {props.label}
      </Text>
      {props.item}
    </div>
  )
}
