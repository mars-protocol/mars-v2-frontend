import BigNumber from 'bignumber.js'
import React, { useMemo } from 'react'

import Card from 'components/common/Card'
import Divider from 'components/common/Divider'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { SwapIcon } from 'components/common/Icons'
import Text from 'components/common/Text'
import AssetImage from 'components/common/assets/AssetImage'
import { MAX_AMOUNT_DECIMALS } from 'constants/math'
import { RouteHop } from 'hooks/swap/useSwapRoute'

interface Props {
  fromAsset: Asset
  toAsset: Asset
  amount: BigNumber
  expectedOutput?: BigNumber
  slippage?: number
  priceImpact?: number
  route?: RouteHop[]
  isLoading?: boolean
  routeDescription?: string
}

export default function SwapDetails({
  fromAsset,
  toAsset,
  amount,
  expectedOutput,
  slippage = 0,
  priceImpact = 0,
  route = [],
  isLoading = false,
  routeDescription,
}: Props) {
  const isAmountZero = amount.isZero() || amount.isLessThanOrEqualTo(0)

  const minReceived = useMemo(() => {
    if (!expectedOutput) return undefined

    const slippageFactor = new BigNumber(1).minus(new BigNumber(slippage))
    return expectedOutput.multipliedBy(slippageFactor)
  }, [expectedOutput, slippage])

  return (
    <Card className='w-full'>
      <div className='p-4'>
        <div className='flex items-center justify-between mb-3'>
          <Text size='sm' className='font-semibold'>
            Swap Details
          </Text>
        </div>

        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center'>
            <AssetImage asset={fromAsset} className='w-5 h-5 mr-2' />
            <Text size='sm'>{fromAsset.symbol}</Text>
          </div>
          <SwapIcon className='w-5 h-5 text-white/50' />
          <div className='flex items-center'>
            <AssetImage asset={toAsset} className='w-5 h-5 mr-2' />
            <Text size='sm'>{toAsset.symbol}</Text>
          </div>
        </div>

        <Divider className='my-2' />

        <div className='grid grid-cols-2 gap-2'>
          <Text size='xs' className='text-white/50'>
            Min. Receive ({slippage * 100}% slippage):
          </Text>
          <Text size='xs' className='text-right'>
            {isAmountZero ? (
              '-'
            ) : isLoading ? (
              'Calculating...'
            ) : minReceived ? (
              <FormattedNumber
                amount={minReceived.toNumber()}
                options={{
                  decimals: toAsset.decimals,
                  maxDecimals: MAX_AMOUNT_DECIMALS,
                  abbreviated: false,
                  suffix: ` ${toAsset.symbol}`,
                }}
              />
            ) : (
              'Calculating...'
            )}
          </Text>

          {!isAmountZero && !isLoading && (
            <>
              <Text size='xs' className='text-white/50'>
                Price Impact:
              </Text>
              <Text
                size='xs'
                className={`text-right ${priceImpact > 1 ? 'text-red-400' : priceImpact > 0.5 ? 'text-yellow-400' : 'text-green-400'}`}
              >
                {priceImpact <= 0 ? '-' : `${priceImpact.toFixed(2)}%`}
              </Text>
            </>
          )}

          {(routeDescription || (route && route.length > 0)) && (
            <>
              <Text size='xs' className='text-white/50'>
                Route:
              </Text>
              <Text size='xs' className='text-right'>
                {isAmountZero || isLoading ? '-' : routeDescription || ''}
              </Text>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
