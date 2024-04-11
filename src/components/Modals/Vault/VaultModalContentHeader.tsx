import { useMemo } from 'react'

import { BNCoin } from 'classes/BNCoin'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { BN } from 'utils/helpers'

interface Props {
  vault: Vault | DepositedVault
}

export default function VaultModalContentHeader({ vault }: Props) {
  const depositedValue = useMemo(() => {
    if ('values' in vault) {
      const value = vault.values.primary
        .plus(vault.values.secondary)
        .plus(vault.values.unlocked)
        .plus(vault.values.unlocking)
        .shiftedBy(-PRICE_ORACLE_DECIMALS)

      // To eliminate super small leftover amounts
      // If USD value is smaller than 0.001 returns 0
      return BN(value.toFixed(PRICE_ORACLE_DECIMALS / 2))
    } else {
      return BN_ZERO
    }
  }, [vault])

  return (
    <div className='flex gap-6 px-6 py-4 border-b border-white/5 gradient-header'>
      <TitleAndSubCell
        title={
          <div className='flex flex-row'>
            <FormattedNumber amount={vault?.apy ?? 0} options={{ suffix: '%' }} animate />
            <FormattedNumber
              className='ml-2 text-xs'
              amount={vault?.apy ?? 0 / 365}
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

      {vault.cap && (
        <TitleAndSubCell
          title={
            <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber(vault.cap.denom, vault.cap.max)} />
          }
          sub={'Deposit Cap'}
        />
      )}
    </div>
  )
}
