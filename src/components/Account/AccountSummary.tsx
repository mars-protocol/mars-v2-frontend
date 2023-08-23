import { useMemo } from 'react'

import Accordion from 'components/Accordion'
import AccountBalancesTable from 'components/Account/AccountBalancesTable'
import AccountComposition from 'components/Account/AccountComposition'
import AccountHealth from 'components/Account/AccountHealth'
import Card from 'components/Card'
import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import Text from 'components/Text'
import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useHealthComputer from 'hooks/useHealthComputer'
import useIsOpenArray from 'hooks/useIsOpenArray'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountBalanceValue, calculateAccountLeverage } from 'utils/accounts'

interface Props {
  account?: Account
  change?: AccountChange
}

export default function AccountSummary(props: Props) {
  const [isOpen, toggleOpen] = useIsOpenArray(2, true)
  const { data: prices } = usePrices()
  const accountBalance = useMemo(
    () => (props.account ? calculateAccountBalanceValue(props.account, prices) : BN_ZERO),
    [props.account, prices],
  )
  const { availableAssets: borrowAvailableAssets, accountBorrowedAssets } =
    useBorrowMarketAssetsTableData()
  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()
  const borrowAssetsData = useMemo(
    () => [...borrowAvailableAssets, ...accountBorrowedAssets],
    [borrowAvailableAssets, accountBorrowedAssets],
  )
  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )

  const { health } = useHealthComputer(props.account)
  const leverage = useMemo(
    () => (props.account ? calculateAccountLeverage(props.account, prices) : BN_ZERO),
    [props.account, prices],
  )
  if (!props.account) return null

  return (
    <div className='h-[546px] min-w-[345px] basis-[345px] overflow-y-scroll scrollbar-hide'>
      <Card className='mb-4 h-min min-w-fit bg-white/10' contentClassName='flex'>
        <Item title='Networth'>
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, accountBalance)}
            className='text-xs'
          />
        </Item>
        <Item title='Leverage'>
          <FormattedNumber
            className='text-xs'
            amount={leverage.toNumber()}
            options={{ minDecimals: 2, maxDecimals: 2, suffix: 'x' }}
            animate
          />
        </Item>
        <Item title='Account Health'>
          <AccountHealth health={health} />
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
              props.account ? (
                <AccountBalancesTable
                  account={props.account}
                  borrowingData={borrowAssetsData}
                  lendingData={lendingAssetsData}
                />
              ) : null,
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
      className='flex flex-wrap items-center gap-1 px-4 py-2 border-r border-r-white/10'
      {...props}
    >
      <Text size='xs' className='w-full text-white/50'>
        {props.title}
      </Text>
      {props.children}
    </div>
  )
}
