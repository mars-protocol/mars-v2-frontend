import classNames from 'classnames'

import { VAULT_DEPOSIT_BUFFER } from 'constants/vaults'
import useAsset from 'hooks/assets/useAsset'
import { BNCoin } from 'types/classes/BNCoin'
import DisplayCurrency from './DisplayCurrency'
import { FormattedNumber } from './FormattedNumber'
import TitleAndSubCell from './TitleAndSubCell'

interface Props {
  depositCap: DepositCap
}

export default function DepositCapCell(props: Props) {
  const percent = props.depositCap.used
    .dividedBy(props.depositCap.max.multipliedBy(VAULT_DEPOSIT_BUFFER))
    .multipliedBy(100)
    .integerValue()
  const depositCapUsed = Math.min(percent.toNumber(), 100)
  const decimals = useAsset(props.depositCap.denom)?.decimals ?? 6

  return (
    <TitleAndSubCell
      title={
        <DisplayCurrency
          coin={BNCoin.fromDenomAndBigNumber(props.depositCap.denom, props.depositCap.max)}
          className='text-xs'
        />
      }
      sub={
        <FormattedNumber
          amount={depositCapUsed}
          options={{ minDecimals: 2, maxDecimals: 2, suffix: '% Filled' }}
          className={classNames(
            'text-xs',
            depositCapUsed >= 100 ? 'text-loss/60' : depositCapUsed > 90 ? 'text-info/60' : '',
          )}
          animate
        />
      }
    />
  )
}
