import { useMemo, useState } from 'react'

import { BN_ZERO } from '../../../constants/math'
import useToggle from '../../../hooks/common/useToggle'
import usePerpsMarket from '../../../hooks/perps/usePerpsMarket'
import { FormattedNumber } from '../../common/FormattedNumber'
import { ChevronDown } from '../../common/Icons'
import { Tooltip } from '../../common/Tooltip'

type Interval = '1H' | '1D' | '1W' | '1M' | '1Y'

enum Intervals {
  '1H' = 1 / 24,
  '1D' = 1,
  '1W' = 7,
  '1M' = 31,
  '1Y' = 365,
}

export default function FundingRate() {
  const market = usePerpsMarket()
  const [interval, setInterval] = useState<Interval>('1H')
  const [show, toggleShow] = useToggle(false)

  const fundingRate = useMemo(() => {
    return market?.fundingRate.times(Intervals[interval]) ?? BN_ZERO
  }, [interval, market?.fundingRate])

  if (!market) return '-'

  return (
    <div className='flex gap-1 items-center'>
      <FormattedNumber
        className='text-xs inline'
        amount={fundingRate.toNumber()}
        options={{ minDecimals: 6, maxDecimals: 6, suffix: '%' }}
      />
      <Tooltip
        content={
          <div>
            {Object.keys(Intervals)
              .filter((key) => isNaN(Number(key)))
              .map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setInterval(key as Interval)
                    toggleShow(false)
                  }}
                  className='w-full text-center px-3 py-1.5 flex gap-2 items-center hover:bg-white/5 text-[10px]'
                >
                  {key}
                </button>
              ))}
          </div>
        }
        type='info'
        placement='bottom'
        contentClassName='!bg-white/10 border border-white/20 backdrop-blur-xl !p-0'
        interactive
        hideArrow
        visible={show}
        onClickOutside={() => toggleShow(false)}
      >
        <button
          onClick={() => toggleShow()}
          className='flex gap-1 bg-white/10 rounded-sm items-center text-[10px] px-1.5 py-0.5'
        >
          {interval}
          <ChevronDown className='h-2 w-2' />
        </button>
      </Tooltip>
    </div>
  )
}
