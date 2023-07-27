import { useMemo } from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
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
        .shiftedBy(-PRICE_ORACLE_DECIMALS)
      // To eliminate super small leftover amounts
      // If value is smaller than 0.001 it's returning 0
      return BN(value.toFixed(PRICE_ORACLE_DECIMALS / 2))
    } else {
      return BN_ZERO
    }
  }, [vault])

  return (
    <div className='flex gap-6 border-b border-white/5 px-6 py-4 gradient-header'>
      {vault.apy && (
        <>
          <TitleAndSubCell
            title={
              <div className='flex flex-row'>
                <FormattedNumber
                  amount={vault.apy}
                  options={{ suffix: '%', decimals: -2 }}
                  animate
                />
                <FormattedNumber
                  className='ml-2 text-xs'
                  amount={vault.apy / 365}
                  options={{ suffix: '%/day', decimals: -2 }}
                  animate
                />
              </div>
            }
            sub={'Deposit APY'}
          />
          <div className='h-100 w-[1px] bg-white/10'></div>
        </>
      )}
      {!depositedValue.isZero() && (
        <>
          <TitleAndSubCell
            title={<DisplayCurrency coin={BNCoin.fromDenomAndBigNumber('usd', depositedValue)} />}
            sub={'Deposited'}
          />
          <div className='h-100 w-[1px] bg-white/10'></div>
        </>
      )}

      <TitleAndSubCell
        title={
          <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber(vault.cap.denom, vault.cap.max)} />
        }
        sub={'Deposit Cap'}
      />
    </div>
  )
}
