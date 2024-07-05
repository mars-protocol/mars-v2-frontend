import { useMemo } from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

interface Props {
  farm: Farm | DepositedFarm
}

export default function FarmModalContentHeader({ farm }: Props) {
  const depositedValue = useMemo(() => {
    if ('values' in farm) {
      const value = farm.values.primary
        .plus(farm.values.secondary)
        .shiftedBy(-PRICE_ORACLE_DECIMALS)

      // To eliminate super small leftover amounts
      // If USD value is smaller than 0.001 returns 0
      return BN(value.toFixed(PRICE_ORACLE_DECIMALS / 2))
    } else {
      return BN_ZERO
    }
  }, [farm])

  return (
    <div className='flex gap-6 px-6 py-4 border-b border-white/5 gradient-header'>
      <TitleAndSubCell
        title={
          <div className='flex flex-row'>
            <FormattedNumber amount={farm?.apy ?? 0} options={{ suffix: '%' }} animate />
            <FormattedNumber
              className='ml-2 text-xs'
              amount={farm?.apy ?? 0 / 365}
              options={{ suffix: '%/day' }}
              parentheses
              animate
            />
          </div>
        }
        sub={'Deposit APY'}
      />
      <div className='h-100 w-[1px] bg-white/10'></div>
      {!depositedValue.isZero() && (
        <>
          <TitleAndSubCell
            title={<DisplayCurrency coin={BNCoin.fromDenomAndBigNumber('usd', depositedValue)} />}
            sub={'Deposited'}
          />
          <div className='h-100 w-[1px] bg-white/10'></div>
        </>
      )}

      {farm.cap && (
        <TitleAndSubCell
          title={
            <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber(farm.cap.denom, farm.cap.max)} />
          }
          sub={'Deposit Cap'}
        />
      )}
    </div>
  )
}
