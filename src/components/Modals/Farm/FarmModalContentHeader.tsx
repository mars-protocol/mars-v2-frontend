import { useMemo } from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  farm: Farm | DepositedFarm
  account: Account
}

export default function FarmModalContentHeader({ farm, account }: Props) {
  const deposited = useMemo(() => {
    const farmPosition = account.stakedAstroLps.find(
      (position) => position.denom === farm.denoms.lp,
    )
    if (!farmPosition) return BNCoin.fromDenomAndBigNumber(farm.denoms.lp, BN_ZERO)

    return farmPosition
  }, [account.stakedAstroLps, farm.denoms.lp])

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
      {!deposited.amount.isZero() && (
        <>
          <TitleAndSubCell title={<DisplayCurrency coin={deposited} />} sub={'Deposited'} />
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
