import classNames from 'classnames'
import { useEffect, useState } from 'react'

import { FormattedNumber, Text, Tooltip } from 'components'

interface Props {
  balance: number
  limit: number
  max: number
  barHeight?: string
  showTitle?: boolean
  showPercentageText?: boolean
  className?: string
  hideValues?: boolean
  decimals?: number
}

export const BorrowCapacity = ({
  balance,
  limit,
  max,
  barHeight = '22px',
  showTitle = true,
  showPercentageText = true,
  className,
  hideValues,
  decimals = 2,
}: Props) => {
  const [percentOfMaxRound, setPercentOfMaxRound] = useState(0)
  const [percentOfMaxRange, setPercentOfMaxRange] = useState(0)
  const [limitPercentOfMax, setLimitPercentOfMax] = useState(0)

  useEffect(() => {
    if (max === 0) {
      setPercentOfMaxRound(0)
      setPercentOfMaxRange(0)
      setLimitPercentOfMax(0)
      return
    }

    const pOfMax = +((balance / max) * 100)
    setPercentOfMaxRound(+(Math.round(pOfMax * 100) / 100))
    setPercentOfMaxRange(Math.min(Math.max(pOfMax, 0), 100))
    setLimitPercentOfMax((limit / max) * 100)
  }, [balance, max, limit])

  return (
    <div className={classNames('flex items-center justify-center', className)}>
      <div style={{ width: '100%' }}>
        <div
          className='flex justify-between'
          style={{
            width: `${limitPercentOfMax ? limitPercentOfMax + 6 : '100'}%`,
            marginBottom: !showTitle && hideValues ? 0 : 12,
          }}
        >
          <div className='text-sm-caps'>{showTitle && 'Borrow Capacity'}</div>
          {!hideValues && (
            <div
              className={classNames(
                'duration-800 transition-[opcity] delay-[1600ms] text-3xs-caps',
                limitPercentOfMax ? 'opacity-60' : 'opacity-0',
              )}
            >
              <FormattedNumber animate amount={limit} />
            </div>
          )}
        </div>
        <Tooltip content={<Text size='sm'>Borrow Capacity Tooltip</Text>}>
          <div className='relative'>
            <div
              className='overflow-hidden rounded-3xl border-r-2 border-r-loss '
              style={{ height: barHeight }}
            >
              <div className='absolute h-full w-full rounded-lg shadow-inset gradient-hatched '>
                <div
                  className='ease-loss absolute left-0 h-full max-w-full rounded-l-3xl bg-body-dark transition-[right] duration-1000'
                  style={{
                    right: `${limitPercentOfMax ? 100 - limitPercentOfMax : 100}%`,
                  }}
                />

                <div className='absolute top-0 h-full w-full'>
                  <div
                    className='h-full rounded-lg transition-[width] duration-1000 ease-linear'
                    style={{
                      width: `${percentOfMaxRange || 0.02}%`,
                      WebkitMask: 'linear-gradient(#fff 0 0)',
                    }}
                  >
                    <div className='absolute top-0 bottom-0 left-0 right-0 gradient-limit' />
                  </div>

                  <div
                    className='absolute bottom-0 h-[120%] w-[1px] bg-white transition-[left] duration-1000 ease-linear'
                    style={{ left: `${limitPercentOfMax || 0}%` }}
                  />
                  {showPercentageText ? (
                    <span className='absolute top-1/2 mt-[1px] w-full -translate-y-1/2 animate-fadein text-center opacity-0 text-2xs-caps'>
                      {max !== 0 && (
                        <FormattedNumber
                          className='text-white'
                          animate
                          amount={percentOfMaxRound}
                          minDecimals={decimals}
                          maxDecimals={decimals}
                          suffix='%'
                          abbreviated={false}
                        />
                      )}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </Tooltip>
        {!hideValues && (
          <div className='mt-2 flex opacity-60 text-3xs-caps'>
            <FormattedNumber animate amount={balance} className='mr-1' />
            <span className='mr-1'>of</span>
            <FormattedNumber animate amount={max} />
          </div>
        )}
      </div>
    </div>
  )
}
