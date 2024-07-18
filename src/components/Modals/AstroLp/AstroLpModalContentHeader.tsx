import { useMemo } from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  astroLp: AstroLp | DepositedAstroLp
  account: Account
}

export default function AstroLpModalContentHeader({ astroLp, account }: Props) {
  const deposited = useMemo(() => {
    const astroLpPosition = account.stakedAstroLps.find(
      (position) => position.denom === astroLp.denoms.lp,
    )
    if (!astroLpPosition) return BNCoin.fromDenomAndBigNumber(astroLp.denoms.lp, BN_ZERO)

    return astroLpPosition
  }, [account.stakedAstroLps, astroLp.denoms.lp])

  return (
    <div className='flex gap-6 px-6 py-4 border-b border-white/5 gradient-header'>
      <TitleAndSubCell
        title={
          <div className='flex flex-row'>
            <FormattedNumber amount={astroLp?.apy ?? 0} options={{ suffix: '%' }} animate />
            <FormattedNumber
              className='ml-2 text-xs'
              amount={astroLp?.apy ?? 0 / 365}
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

      {astroLp.cap && (
        <TitleAndSubCell
          title={
            <DisplayCurrency
              coin={BNCoin.fromDenomAndBigNumber(astroLp.cap.denom, astroLp.cap.max)}
            />
          }
          sub={'Deposit Cap'}
        />
      )}
    </div>
  )
}
