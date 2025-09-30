import classNames from 'classnames'
import { useEffect, useState } from 'react'

import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

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
  const chainConfig = useChainConfig()
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )
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
                !reduceMotion && 'duration-800 transition-[opcity] delay-[1600ms]',
                'text-3xs-caps',
                limitPercentOfMax ? 'opacity-50' : 'opacity-0',
              )}
            >
              <FormattedNumber amount={limit} />
            </div>
          )}
        </div>
        <Tooltip type='info' content={<Text size='sm'>Borrow Capacity Tooltip</Text>}>
          <div className='relative'>
            <div
              className='overflow-hidden border-r-2 rounded-3xl border-r-loss '
              style={{ height: barHeight }}
            >
              <div className='absolute w-full h-full shadow-inset gradient-hatched '>
                <div
                  className={classNames(
                    'absolute left-0 h-full max-w-full bg-body-dark',
                    !reduceMotion && 'transition-[right] duration-1000 ease-linear',
                  )}
                  style={{
                    right: `${limitPercentOfMax ? 100 - limitPercentOfMax : 100}%`,
                  }}
                />

                <div className='absolute top-0 w-full h-full'>
                  <div
                    className={classNames(
                      'h-full',
                      !reduceMotion && 'transition-[width] duration-1000 ease-linear',
                    )}
                    style={{
                      width: `${percentOfMaxRange || 0.02}%`,
                      WebkitMask: 'linear-gradient(#fff 0 0)',
                    }}
                  >
                    <div className='absolute top-0 bottom-0 left-0 right-0 gradient-limit' />
                  </div>

                  <div
                    className={classNames(
                      'absolute bottom-0 h-[120%] w-[1px] bg-white',
                      !reduceMotion && 'transition-[left] duration-1000 ease-linear',
                    )}
                    style={{ left: `${limitPercentOfMax || 0}%` }}
                  />
                  {showPercentageText ? (
                    <span
                      className={classNames(
                        'absolute top-1/2 mt-[1px] w-full -translate-y-1/2 text-center text-2xs-caps',
                        !reduceMotion && 'animate-fadein opacity-0',
                      )}
                    >
                      {max !== 0 && (
                        <FormattedNumber
                          className='text-white'
                          options={{
                            minDecimals: decimals,
                            maxDecimals: decimals,
                            suffix: '%',
                          }}
                          amount={percentOfMaxRound}
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
          <div className='flex mt-2 opacity-50 text-3xs-caps'>
            <FormattedNumber amount={balance} className='mr-1' />
            <span className='mr-1'>of</span>
            <FormattedNumber amount={max} />
          </div>
        )}
      </div>
    </div>
  )
}
