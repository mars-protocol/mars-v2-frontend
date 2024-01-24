import classNames from 'classnames'
import { HTMLAttributes, useCallback, useMemo } from 'react'

import AccountBalancesTable from 'components/account/AccountBalancesTable'
import AccountComposition from 'components/account/AccountComposition'
import AccountPerpPositionTable from 'components/account/AccountPerpPositionTable'
import HealthBar from 'components/account/Health/HealthBar'
import Accordion from 'components/common/Accordion'
import Card from 'components/common/Card'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useAllAssets from 'hooks/assets/useAllAssets'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useHealthComputer from 'hooks/useHealthComputer'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountBalanceValue, calculateAccountLeverage } from 'utils/accounts'

interface Props {
  account: Account
  isHls?: boolean
}

export default function AccountSummary(props: Props) {
  const [accountSummaryTabs, setAccountSummaryTabs] = useLocalStorage<boolean[]>(
    LocalStorageKeys.ACCOUNT_SUMMARY_TABS,
    DEFAULT_SETTINGS.accountSummaryTabs,
  )
  const { data: prices } = usePrices()
  const assets = useAllAssets()
  const updatedAccount = useStore((s) => s.updatedAccount)
  const chainConfig = useStore((s) => s.chainConfig)
  const accountBalance = useMemo(
    () =>
      props.account
        ? calculateAccountBalanceValue(updatedAccount ?? props.account, prices, assets)
        : BN_ZERO,
    [props.account, updatedAccount, prices, assets],
  )
  const data = useBorrowMarketAssetsTableData()
  const borrowAssetsData = useMemo(() => data?.allAssets || [], [data])
  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()

  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )
  const { health, healthFactor } = useHealthComputer(props.account)
  const { health: updatedHealth, healthFactor: updatedHealthFactor } =
    useHealthComputer(updatedAccount)
  const leverage = useMemo(
    () => (props.account ? calculateAccountLeverage(props.account, prices, assets) : BN_ZERO),
    [props.account, prices, assets],
  )
  const updatedLeverage = useMemo(() => {
    if (!updatedAccount) return null
    const updatedLeverage = calculateAccountLeverage(updatedAccount, prices, assets)

    if (updatedLeverage.eq(leverage)) return null
    return updatedLeverage
  }, [updatedAccount, prices, assets, leverage])

  const handleToggle = useCallback(
    (index: number) => {
      setAccountSummaryTabs(accountSummaryTabs.map((tab, i) => (i === index ? !tab : tab)))
    },
    [accountSummaryTabs, setAccountSummaryTabs],
  )

  const items = [
    {
      title: `Credit Account ${props.account.id} Composition`,
      renderContent: () =>
        props.account ? <AccountComposition account={props.account} isHls={props.isHls} /> : null,
      isOpen: accountSummaryTabs[0],
      toggleOpen: (index: number) => handleToggle(index),
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
            hideCard
            isHls={props.isHls}
          />
        ) : null,
      isOpen: accountSummaryTabs[1],
      toggleOpen: (index: number) => handleToggle(index),
      renderSubTitle: () => <></>,
    },
  ]

  if (chainConfig.perps)
    items.push({
      title: 'Perp Positions',
      renderContent: () =>
        props.account && props.account.perps.length > 0 ? (
          <AccountPerpPositionTable account={props.account} hideCard />
        ) : null,
      isOpen: accountSummaryTabs[2] ?? false,
      toggleOpen: (index: number) => handleToggle(index),
      renderSubTitle: () => <></>,
    })

  if (!props.account) return null
  return (
    <div className='h-[546px] max-w-screen overflow-y-scroll scrollbar-hide w-93.5'>
      <Card className='mb-4 h-min min-w-fit bg-white/10' contentClassName='flex'>
        <Item label='Net worth' classes='flex-1'>
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, accountBalance)}
            className='text-2xs'
          />
        </Item>
        <Item label='Leverage' classes='flex-1 w-[93px]'>
          <FormattedNumber
            className={'w-full text-center text-2xs'}
            amount={isNaN(leverage.toNumber()) ? 0 : leverage.toNumber()}
            options={{
              maxDecimals: 2,
              minDecimals: 2,
              suffix: 'x',
            }}
            animate
          />
          {updatedLeverage && (
            <>
              <ArrowRight width={12} />
              <FormattedNumber
                className={classNames(
                  'w-full text-center text-2xs',
                  updatedLeverage?.isGreaterThan(leverage) && 'text-loss',
                  updatedLeverage?.isLessThan(leverage) && 'text-profit',
                )}
                amount={isNaN(updatedLeverage.toNumber()) ? 0 : updatedLeverage?.toNumber()}
                options={{ maxDecimals: 2, minDecimals: 2, suffix: 'x' }}
                animate
              />
            </>
          )}
        </Item>
        <Item label='Account health'>
          <HealthBar
            health={health}
            healthFactor={healthFactor}
            updatedHealth={updatedHealth}
            updatedHealthFactor={updatedHealthFactor}
            className='h-1'
          />
        </Item>
      </Card>
      <Accordion items={items} allowMultipleOpen />
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
