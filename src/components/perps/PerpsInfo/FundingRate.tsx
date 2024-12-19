import { useMemo } from 'react'

import { FormattedNumber } from 'components/common/FormattedNumber'
import { ChevronDown } from 'components/common/Icons'
import { Tooltip } from 'components/common/Tooltip'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useChainConfig from 'hooks/chain/useChainConfig'
import useToggle from 'hooks/common/useToggle'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import usePerpsMarket from 'hooks/perps/usePerpsMarket'

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
  const chainConfig = useChainConfig()
  const [interval, setInterval] = useLocalStorage<Interval>(
    LocalStorageKeys.FUNDING_RATE_INTERVAL,
    getDefaultChainSettings(chainConfig).fundingRateInterval as Interval,
  )
  const [show, toggleShow] = useToggle(false)

  const fundingRate = useMemo(() => {
    return market?.fundingRate.times(Intervals[interval]) ?? BN_ZERO
  }, [interval, market?.fundingRate])

  if (!market) return '-'

  const rate = fundingRate.toNumber()
  const decimals = Math.abs(rate) < 1 ? 6 : 2

  return (
    <div className='flex items-center gap-1'>
      <FormattedNumber
        className='inline text-sm'
        amount={rate}
        options={{ minDecimals: 2, maxDecimals: decimals, suffix: '%' }}
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
                  className='w-full text-center px-3 py-1.5 flex gap-2 items-center hover:bg-white/5 text-xs'
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
          className='flex gap-1 bg-white/10 rounded-sm items-center text-xs px-1.5 py-0.5'
        >
          {interval}
          <ChevronDown className='w-2 h-2' />
        </button>
      </Tooltip>
    </div>
  )
}
