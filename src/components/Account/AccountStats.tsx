'use client'
import BigNumber from 'bignumber.js'

import AccountHealth from 'components/Account/AccountHealth'
import DisplayCurrency from 'components/DisplayCurrency'
import useStore from 'store'

interface Props {
  balance: BigNumber
  risk: number
  health: number
}

export default function AccountStats(props: Props) {
  const baseCurrency = useStore((s) => s.baseCurrency)

  return (
    <div className='w-full flex-wrap'>
      <DisplayCurrency
        coin={{ amount: props.balance.toString(), denom: baseCurrency.denom }}
        className='w-full text-xl'
      />
      <div className='mt-1 flex w-full items-center'>
        <AccountHealth health={props.health} classNames='w-[140px]' hasLabel />
      </div>
    </div>
  )
}
