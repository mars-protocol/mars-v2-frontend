import classNames from 'classnames'
import { useEffect, useState } from 'react'

import Number from 'components/Number'
import Tooltip from 'components/Tooltip'

interface Props {
  balance: number
  limit: number
  max: number
  barHeight?: string
  showTitle?: boolean
  showPercentageText?: boolean
  className?: string
  hideValues?: boolean
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
}: Props) => {
  const [percentOfMaxRound, setPercentOfMaxRound] = useState(0)
  const [percentOfMaxRange, setPercentOfMaxRange] = useState(0)
  const [percentOfMaxMargin, setPercentOfMaxMargin] = useState('10px')
  const [limitPercentOfMax, setLimitPercentOfMax] = useState(0)
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout>>()

  useEffect(
    () => {
      clearTimeout(timer)
      const percent = max === 0 ? 0 : (balance / max) * 100
      const delta = percent - percentOfMaxRound
      const startingPoint = percentOfMaxRound

      if (max === 0) {
        setPercentOfMaxMargin('10px')
        setPercentOfMaxRound(0)
        setPercentOfMaxRange(0)
        setLimitPercentOfMax(0)
        return
      }

      const pOfMax = +((balance / max) * 100).toFixed(2)
      setPercentOfMaxRound(+(Math.round(pOfMax * 100) / 100).toFixed(1))
      setPercentOfMaxRange(Math.min(Math.max(pOfMax, 0), 100))
      setLimitPercentOfMax((limit / max) * 100)

      for (let i = 0; i < 20; i++) {
        setTimer(
          setTimeout(() => {
            const currentPercentOfMax = startingPoint + (delta / 20) * i
            setPercentOfMaxMargin(currentPercentOfMax > 15 ? '-60px' : '10px')
          }, 50 * (i + 1)),
        )
      }
      return () => clearTimeout(timer)
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [balance, max],
  )

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
              <Number animate={true} amount={limit} />
            </div>
          )}
        </div>
        <Tooltip content='Tooltip'>
          <div className='relative' style={{ height: barHeight }}>
            <div className='absolute h-full w-full rounded-3xl shadow-inset gradient-hatched'>
              <div
                className='absolute bottom-0 h-[120%] w-[1px] bg-white transition-[left] duration-1000 ease-linear'
                style={{ left: `${limitPercentOfMax || 0}%` }}
              />
              <div
                className='absolute left-0 h-full max-w-full rounded-l-3xl bg-body-dark transition-[right] duration-1000 ease-linear'
                style={{
                  right: `${limitPercentOfMax ? 100 - limitPercentOfMax : 100}%`,
                }}
              ></div>

              <div className='absolute top-0 h-full w-full overflow-hidden'>
                <div
                  className='h-full rounded-l transition-[width] duration-1000 ease-linear'
                  style={{
                    width: `${percentOfMaxRange || 0.01}%`,
                    WebkitMask: 'linear-gradient(#fff 0 0)',
                  }}
                >
                  <div className='absolute top-0 bottom-0 left-0 right-0 gradient-limit' />
                </div>
                {showPercentageText ? (
                  <span
                    className='absolute top-1/2 w-[53px] -translate-y-1/2 transition-[left] duration-1000 ease-linear text-2xs-caps'
                    style={{
                      left: `${percentOfMaxRange}%`,
                      marginLeft: percentOfMaxMargin,
                    }}
                  >
                    {max !== 0 && (
                      <Number
                        animate={true}
                        amount={percentOfMaxRound}
                        suffix='%'
                        abbreviated={false}
                      />
                    )}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </Tooltip>
        {!hideValues && (
          <div className='mt-2 flex opacity-60 text-3xs-caps'>
            <Number animate={true} amount={balance} className='mr-1' />
            <span className='mr-1'>of</span>
            <Number animate={true} amount={max} />
          </div>
        )}
      </div>
    </div>
  )
}
