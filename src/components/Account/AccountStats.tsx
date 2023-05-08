'use client'
import DisplayCurrency from 'components/DisplayCurrency'
import useStore from 'store'

import AccountHealth from './AccountHealth'

interface Props {
  balance: number
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
