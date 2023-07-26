import Accordion from 'components/Accordion'
import { AccountBalancesTable } from 'components/Account/AccountBalancesTable'
import AccountComposition from 'components/Account/AccountComposition'
import AccountHealth from 'components/Account/AccountHealth'
import Card from 'components/Card'
import DisplayCurrency from 'components/DisplayCurrency'
import { ArrowChartLineUp } from 'components/Icons'
import Text from 'components/Text'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { DISPLAY_CURRENCY_KEY } from 'constants/localStore'
import { BN_ZERO } from 'constants/math'
import useIsOpenArray from 'hooks/useIsOpenArray'
import useLocalStorage from 'hooks/useLocalStorage'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountDeposits } from 'utils/accounts'

interface Props {
  account?: Account
  change?: AccountChange
}

export default function AccountSummary(props: Props) {
  const [isOpen, toggleOpen] = useIsOpenArray(2, true)
  const { data: prices } = usePrices()
  const [displayCurrency] = useLocalStorage<string>(
    DISPLAY_CURRENCY_KEY,
    DEFAULT_SETTINGS.displayCurrency,
  )
  const baseCurrency = useStore((s) => s.baseCurrency)
  const accountBalance = props.account
    ? calculateAccountDeposits(props.account, prices, displayCurrency)
    : BN_ZERO
  if (!props.account) return null

  return (
    <div className='h-[546px] min-w-[345px] basis-[345px] overflow-y-scroll scrollbar-hide'>
      <Card className='mb-4 h-min min-w-fit bg-white/10' contentClassName='flex'>
        <Item>
          <DisplayCurrency
            coin={new BNCoin({ amount: accountBalance.toString(), denom: baseCurrency.denom })}
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
            renderContent: () =>
              props.account ? (
                <AccountComposition account={props.account} change={props.change} />
              ) : null,
            isOpen: isOpen[0],
            toggleOpen: (index: number) => toggleOpen(index),
            renderSubTitle: () => <></>,
          },
          {
            title: 'Balances',
            renderContent: () =>
              props.account ? <AccountBalancesTable data={props.account} /> : null,
            isOpen: isOpen[1],
            toggleOpen: (index: number) => toggleOpen(index),
            renderSubTitle: () => <></>,
          },
        ]}
        allowMultipleOpen
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
