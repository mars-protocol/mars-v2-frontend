import classNames from 'classnames'
import { HTMLAttributes, useMemo } from 'react'

import Accordion from 'components/Accordion'
import AccountBalancesTable from 'components/Account/AccountBalancesTable'
import AccountComposition from 'components/Account/AccountComposition'
import HealthBar from 'components/Account/HealthBar'
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
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountBalanceValue, calculateAccountLeverage } from 'utils/accounts'

interface Props {
  account: Account
}

export default function AccountSummary(props: Props) {
  const [isOpen, toggleOpen] = useIsOpenArray(2, true)
  const { data: prices } = usePrices()
  const updatedAccount = useStore((s) => s.updatedAccount)
  const accountBalance = useMemo(
    () =>
      props.account
        ? calculateAccountBalanceValue(updatedAccount ?? props.account, prices)
        : BN_ZERO,
    [props.account, updatedAccount, prices],
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
  const { health: updatedHealth } = useHealthComputer(updatedAccount)
  const leverage = useMemo(
    () =>
      props.account ? calculateAccountLeverage(updatedAccount ?? props.account, prices) : BN_ZERO,
    [props.account, updatedAccount, prices],
  )
  if (!props.account) return null
  return (
    <div className='h-[546px] min-w-92.5 basis-92.5 max-w-screen overflow-y-scroll scrollbar-hide'>
      <Card className='mb-4 h-min min-w-fit bg-white/10' contentClassName='flex'>
        <Item label='Net worth' classes='flex-1'>
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, accountBalance)}
            className='text-sm'
          />
        </Item>
        <Item label='Leverage' classes='flex-1'>
          <FormattedNumber
            className='text-sm'
            amount={isNaN(leverage.toNumber()) ? 0 : leverage.toNumber()}
            options={{ minDecimals: 2, suffix: 'x' }}
          />
        </Item>
        <Item label='Account health'>
          <HealthBar health={health} updatedHealth={updatedHealth} className='w-[184px] h-1' />
        </Item>
      </Card>
      <Accordion
        items={[
          {
            title: `Credit Account ${props.account.id} Composition`,
            renderContent: () =>
              props.account ? <AccountComposition account={props.account} /> : null,
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

interface ItemProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  classes?: string
}

function Item(props: ItemProps) {
  return (
    <div
      className={classNames(
        'flex flex-col justify-around px-3 py-1 border-r border-r-white/10',
        props.classes,
      )}
      {...props}
    >
      <Text size='2xs' className='text-white/50 whitespace-nowrap'>
        {props.label}
      </Text>
      <div className='flex h-4.5 w-full'>{props.children}</div>
    </div>
  )
}
