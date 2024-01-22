import classNames from 'classnames'
import { useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import AccountBalancesTable from 'components/account/AccountBalancesTable'
import AccountComposition from 'components/account/AccountComposition'
import AccountDetailsLeverage from 'components/account/AccountDetails/AccountDetailsLeverage'
import Skeleton from 'components/account/AccountDetails/Skeleton'
import AccountPerpPositionTable from 'components/account/AccountPerpPositionTable'
import { HealthGauge } from 'components/account/Health/HealthGauge'
import EscButton from 'components/common/Button/EscButton'
import { glowElement } from 'components/common/Button/utils'
import Card from 'components/common/Card'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ThreeDots } from 'components/common/Icons'
import Text from 'components/common/Text'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { ORACLE_DENOM } from 'constants/oracle'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useAccounts from 'hooks/accounts/useAccounts'
import useAllAssets from 'hooks/assets/useAllAssets'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useAccountId from 'hooks/useAccountId'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useHLSStakingAssets from 'hooks/useHLSStakingAssets'
import useHealthComputer from 'hooks/useHealthComputer'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import {
  calculateAccountApr,
  calculateAccountBalanceValue,
  calculateAccountLeverage,
} from 'utils/accounts'

export default function AccountDetailsController() {
  const address = useStore((s) => s.address)
  const isHLS = useStore((s) => s.isHLS)
  const { data: accounts, isLoading } = useAccounts('default', address)
  const { data: accountIds } = useAccountIds(address, false, true)
  const accountId = useAccountId()

  const account = useCurrentAccount()
  const focusComponent = useStore((s) => s.focusComponent)
  const isOwnAccount = accountId && accountIds?.includes(accountId)

  if (!address || focusComponent || !isOwnAccount || isHLS) return null

  if ((isLoading && accountId && !focusComponent) || !account) return <Skeleton />

  return <AccountDetails account={account} />
}

interface Props {
  account: Account
}

function AccountDetails(props: Props) {
  const { account } = props
  const location = useLocation()
  const { data: hlsStrategies } = useHLSStakingAssets()
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    DEFAULT_SETTINGS.reduceMotion,
  )
  const updatedAccount = useStore((s) => s.updatedAccount)
  const accountDetailsExpanded = useStore((s) => s.accountDetailsExpanded)
  const { health, healthFactor } = useHealthComputer(account)
  const { health: updatedHealth, healthFactor: updatedHealthFactor } = useHealthComputer(
    updatedAccount || account,
  )
  const { data: prices } = usePrices()
  const assets = useAllAssets()
  const accountBalanceValue = useMemo(
    () => calculateAccountBalanceValue(updatedAccount ?? account, prices, assets),
    [updatedAccount, account, prices, assets],
  )
  const coin = BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, accountBalanceValue)
  const leverage = useMemo(
    () => calculateAccountLeverage(account, prices, assets),
    [account, assets, prices],
  )
  const updatedLeverage = useMemo(() => {
    if (!updatedAccount) return null
    const updatedLeverage = calculateAccountLeverage(updatedAccount, prices, assets)

    if (updatedLeverage.eq(leverage)) return null
    return updatedLeverage
  }, [updatedAccount, prices, leverage, assets])

  const { data } = useBorrowMarketAssetsTableData(false)
  const borrowAssetsData = useMemo(() => data?.allAssets || [], [data])

  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()

  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )
  const apr = useMemo(
    () =>
      calculateAccountApr(
        updatedAccount ?? account,
        borrowAssetsData,
        lendingAssetsData,
        prices,
        hlsStrategies,
        assets,
        account.kind === 'high_levered_strategy',
      ),
    [account, assets, borrowAssetsData, hlsStrategies, lendingAssetsData, prices, updatedAccount],
  )
  const isFullWidth =
    location.pathname.includes('trade') ||
    location.pathname === '/' ||
    location.pathname.includes('perps')

  function AccountDetailsHeader() {
    const onClose = useCallback(() => useStore.setState({ accountDetailsExpanded: false }), [])

    return (
      <div className='flex items-center justify-between w-full p-4 bg-white/10 '>
        <Text size='lg' className='flex items-center flex-grow font-semibold'>
          {`Credit Account ${account.id}`}
        </Text>
        <EscButton onClick={onClose} hideText className='w-6 h-6' />
      </div>
    )
  }

  return (
    <>
      {!isFullWidth && accountDetailsExpanded && (
        <div
          className='absolute w-full h-full hover:cursor-pointer z-1'
          onClick={() => useStore.setState({ accountDetailsExpanded: false })}
        />
      )}
      <div
        data-testid='account-details'
        className={classNames(
          accountDetailsExpanded ? 'right-4' : '-right-90',
          'w-110 flex items-start gap-4 absolute top-6',
          !reduceMotion && 'transition-all duration-300',
        )}
      >
        <div
          className={classNames(
            'flex flex-wrap min-w-16 w-16 group/accountdetail relative',
            'border rounded-base border-white/20',
            'bg-white/5 backdrop-blur-sticky z-2',
            !reduceMotion && 'transition-colors duration-300',
            'hover:bg-white/10 hover:cursor-pointer ',
          )}
          onClick={() => useStore.setState({ accountDetailsExpanded: !accountDetailsExpanded })}
        >
          <div className='flex flex-wrap justify-center w-full py-4'>
            <HealthGauge
              health={health}
              updatedHealth={updatedHealth}
              healthFactor={healthFactor}
              updatedHealthFactor={updatedHealthFactor}
            />
            <Text size='2xs' className='mb-0.5 mt-1 w-full text-center text-white/50'>
              Health
            </Text>
          </div>
          <div className='w-full py-4 border-t border-white/20'>
            <Text size='2xs' className='mb-0.5 w-full text-center text-white/50 whitespace-nowrap'>
              Net worth
            </Text>
            <DisplayCurrency coin={coin} className='w-full text-center truncate text-2xs ' />
          </div>
          <div className='w-full py-4 border-t border-white/20'>
            <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
              Leverage
            </Text>
            <AccountDetailsLeverage
              leverage={leverage.toNumber() || 1}
              updatedLeverage={updatedLeverage?.toNumber() || null}
            />
          </div>
          <div className='w-full py-4 border-t border-white/20'>
            <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
              APR
            </Text>
            <FormattedNumber
              className={'w-full text-center text-2xs'}
              amount={apr.toNumber()}
              options={{ maxDecimals: 2, minDecimals: 2, suffix: '%' }}
              animate
            />
          </div>
          <div
            className={classNames(
              'flex justify-center items-center w-full h-6 opacity-50',
              !reduceMotion && 'transition-[opacity] duration-300',
              'absolute -bottom-6',
              'group-hover/accountdetail:opacity-100',
            )}
          >
            {!accountDetailsExpanded && <ThreeDots className='h-1' />}
          </div>

          {glowElement(!reduceMotion)}
        </div>
        <div className='flex w-90 backdrop-blur-sticky z-2'>
          <Card className='w-90 bg-white/5' title={<AccountDetailsHeader />}>
            <AccountComposition account={account} />
            <Text className='w-full px-4 py-2 text-white bg-white/10'>Balances</Text>
            <AccountBalancesTable
              account={account}
              borrowingData={borrowAssetsData}
              lendingData={lendingAssetsData}
              hideCard
            />
            {account.perps.length > 0 && (
              <>
                <Text className='w-full px-4 py-2 text-white bg-white/10'>Perp Positions</Text>
                <AccountPerpPositionTable account={account} hideCard />
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
