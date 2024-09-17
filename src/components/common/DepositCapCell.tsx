import classNames from 'classnames'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { VAULT_DEPOSIT_BUFFER } from 'constants/vaults'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  depositCap: DepositCap
}

export default function DepositCapCell(props: Props) {
  const percent = props.depositCap.used
    .dividedBy(props.depositCap.max.multipliedBy(VAULT_DEPOSIT_BUFFER))
    .multipliedBy(100)
    .integerValue()
  const depositCapUsed = Math.min(percent.toNumber(), 100)

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
