import BigNumber from 'bignumber.js'

import AccountHealth from 'components/Account/AccountHealth'
import DisplayCurrency from 'components/DisplayCurrency'
import { ORACLE_DENOM } from 'constants/oracle'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  balance: BigNumber
  risk: number
  health: number
}

export default function AccountStats(props: Props) {
  return (
    <div className='w-full flex-wrap'>
      <DisplayCurrency
        coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, props.balance)}
        className='w-full text-xl'
      />
      <div className='mt-1 flex w-full items-center'>
        <AccountHealth health={props.health} classNames='w-[140px]' hasLabel />
      </div>
    </div>
  )
}
