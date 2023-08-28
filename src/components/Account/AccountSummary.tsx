import { HTMLAttributes, useMemo } from 'react'

import Accordion from 'components/Accordion'
import AccountBalancesTable from 'components/Account/AccountBalancesTable'
import AccountComposition from 'components/Account/AccountComposition'
import Card from 'components/Card'
import DisplayCurrency from 'components/DisplayCurrency'
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
import { formatLeverage } from 'utils/formatters'
import HealthBar from 'components/Account/HealthBar'

interface Props {
  account: Account
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
        <Item label='Net worth'>
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, accountBalance)}
            className='text-sm'
          />
        </Item>
        <Item label='Leverage'>
          <Text size='sm'>{formatLeverage(leverage.toNumber())}</Text>
        </Item>
        <Item label='Health'>
          <HealthBar health={health} />
        </Item>
      </Card>
      <Accordion
        items={[
          {
            title: `Subaccount ${props.account.id} Composition`,
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
}

function Item(props: ItemProps) {
  return (
    <div className='flex flex-col  justify-around px-3 py-1 border-r border-r-white/10' {...props}>
      <Text size='2xs' className='text-white/50 whitespace-nowrap'>
        {props.label}
      </Text>
      {props.children}
    </div>
  )
}
