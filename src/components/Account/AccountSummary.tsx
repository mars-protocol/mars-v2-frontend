'use client'

import Accordion from 'components/Accordion'
import { AcccountBalancesTable } from 'components/Account/AccountBalancesTable'
import AccountComposition from 'components/Account/AccountComposition'
import AccountHealth from 'components/Account/AccountHealth'
import Card from 'components/Card'
import DisplayCurrency from 'components/DisplayCurrency'
import { ArrowChartLineUp } from 'components/Icons'
import Text from 'components/Text'
import useStore from 'store'
import { calculateAccountBalance } from 'utils/accounts'
import { BN } from 'utils/helpers'

interface Props {
  account?: Account
  change?: AccountChange
}

export default function AccountSummary(props: Props) {
  const prices = useStore((s) => s.prices)
  const baseCurrency = useStore((s) => s.baseCurrency)
  const accountBalance = props.account ? calculateAccountBalance(props.account, prices) : BN(0)
  if (!props.account) return null

  return (
    <div className='flex max-w-[345px] basis-[345px] flex-wrap'>
      <Card className='mb-4 min-w-fit bg-white/10' contentClassName='flex'>
        <Item>
          <DisplayCurrency
            coin={{ amount: accountBalance.toString(), denom: baseCurrency.denom }}
            className='text-sm'
          />
        </Item>
        <Item>
          <span className='flex h-4 w-4 items-center'>
            <ArrowChartLineUp />
          </span>
          <Text size='sm'>4.5x</Text>
        </Item>
        <Item>
          <AccountHealth health={80} />
        </Item>
      </Card>
      <Accordion
        items={[
          {
            title: `Subaccount ${props.account.id} Composition`,
            content: <AccountComposition account={props.account} change={props.change} />,
            open: true,
          },
          { title: 'Balances', content: <AcccountBalancesTable data={props.account} /> },
        ]}
      />
    </div>
  )
}

function Item(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className='flex flex-1 items-center justify-center gap-1 border-r border-r-white/10 px-2 py-2'
      {...props}
    >
      {props.children}
    </div>
  )
}
