import classNames from 'classnames'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import Skeleton from 'components/account/AccountDetails/Skeleton'
import AccountSummary from 'components/account/AccountSummary'
import AccountSummaryLeverage from 'components/account/AccountSummary/AccountSummaryLeverage'
import { HealthGauge } from 'components/account/Health/HealthGauge'
import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import { glowElement } from 'components/common/Button/utils'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ThreeDots } from 'components/common/Icons'
import Text from 'components/common/Text'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { ORACLE_DENOM } from 'constants/oracle'
import useAccountId from 'hooks/accounts/useAccountId'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useAccounts from 'hooks/accounts/useAccounts'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAssets from 'hooks/assets/useAssets'
import useAstroLpAprs from 'hooks/astroLp/useAstroLpAprs'
import useChainConfig from 'hooks/chain/useChainConfig'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import {
  calculateAccountApy,
  calculateAccountBalanceValue,
  calculateAccountLeverage,
} from 'utils/accounts'

interface Props {
  account: Account
}

interface AccountDetailsControllerProps {
  className?: string
}

export default function AccountDetailsController(props: AccountDetailsControllerProps) {
  const address = useStore((s) => s.address)
  const isHls = useStore((s) => s.isHls)
  const isV1 = useStore((s) => s.isV1)
  const { data: _, isLoading } = useAccounts('default', address)
  const { data: accountIds } = useAccountIds(address, false, true)
  const accountId = useAccountId()
  const account = useCurrentAccount()
  const focusComponent = useStore((s) => s.focusComponent)
  const isOwnAccount = accountId && accountIds?.includes(accountId)
  const hideAccountDetails = !address || focusComponent || !isOwnAccount || isHls || isV1
  const isLoadingAccountDetails = (isLoading && accountId && !focusComponent) || !account

  if (hideAccountDetails) return null
  if (isLoadingAccountDetails) return <Skeleton className={props.className} />

  return <AccountDetails account={account} />
}

function AccountDetails(props: Props) {
  const chainConfig = useChainConfig()
  const { account } = props
  const location = useLocation()
  const { data: vaultAprs } = useVaultAprs()
  const { data: perpsVault } = usePerpsVault()
  const astroLpAprs = useAstroLpAprs()
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )
  const updatedAccount = useStore((s) => s.updatedAccount)
  const accountDetailsExpanded = useStore((s) => s.accountDetailsExpanded)
  const { health, healthFactor } = useHealthComputer(account)
  const { health: updatedHealth, healthFactor: updatedHealthFactor } = useHealthComputer(
    updatedAccount || account,
  )
  const { data: assets } = useAssets()
  const accountBalanceValue = useMemo(
    () => calculateAccountBalanceValue(updatedAccount ?? account, assets),
    [updatedAccount, account, assets],
  )
  const coin = BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, accountBalanceValue)
  const leverage = useMemo(() => calculateAccountLeverage(account, assets), [account, assets])
  const updatedLeverage = useMemo(() => {
    if (!updatedAccount) return null
    const updatedLeverage = calculateAccountLeverage(updatedAccount, assets)

    if (updatedLeverage.eq(leverage)) return null
    return updatedLeverage
  }, [updatedAccount, assets, leverage])

  const data = useBorrowMarketAssetsTableData()
  const borrowAssetsData = useMemo(() => data?.allAssets || [], [data])

  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()

  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )
  const apy = useMemo(
    () =>
      calculateAccountApy(
        updatedAccount ?? account,
        borrowAssetsData,
        lendingAssetsData,
        assets,
        vaultAprs,
        astroLpAprs,
        perpsVault?.apy || 0,
      ),
    [
      updatedAccount,
      account,
      borrowAssetsData,
      lendingAssetsData,
      assets,
      vaultAprs,
      astroLpAprs,
      perpsVault?.apy,
    ],
  )
  const isFullWidth =
    location.pathname.includes('trade') ||
    location.pathname === '/' ||
    location.pathname.includes('perps')

  return (
    <>
      {!isFullWidth && accountDetailsExpanded && (
        <div
          className='absolute hidden w-full h-full hover:cursor-pointer z-1 md:block'
          onClick={() => useStore.setState({ accountDetailsExpanded: false })}
        />
      )}
      <div
        data-testid='account-details'
        className={classNames(
          accountDetailsExpanded ? 'right-4' : '-right-74',
          'w-94 hidden items-start gap-4 absolute top-6 z-2',
          'md:flex',
          !reduceMotion && 'transition-all duration-500',
        )}
      >
        <div
          className={classNames(
            'group/accountdetail relative min-h-75',
            'border rounded-base border-white/20',
            'backdrop-blur-sticky z-3 overflow-hidden',
            !reduceMotion && 'transition-all duration-500',
            accountDetailsExpanded
              ? 'is-expanded w-full h-auto'
              : 'w-16 hover:bg-white/10 hover:cursor-pointer bg-white/5',
          )}
          onClick={() => {
            if (accountDetailsExpanded) return
            useStore.setState({ accountDetailsExpanded: true })
          }}
        >
          <div
            className={classNames(
              'w-16 pr-[1px]',
              accountDetailsExpanded
                ? 'opacity-0 absolute inset-0 -z-1'
                : 'transition-opacity opacity-100 duration-300 delay-200',
            )}
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
              <Text
                size='2xs'
                className='mb-0.5 w-full text-center text-white/50 whitespace-nowrap'
              >
                Net worth
              </Text>
              <DisplayCurrency coin={coin} className='w-full text-center truncate text-2xs ' />
            </div>
            <div className='w-full py-4 border-t border-white/20'>
              <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
                Leverage
              </Text>
              <AccountSummaryLeverage
                leverage={leverage?.toNumber() || 1}
                updatedLeverage={updatedLeverage?.toNumber() || null}
              />
            </div>
            <div className='w-full py-4 border-t border-white/20'>
              <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
                APY
              </Text>
              <FormattedNumber
                className={'w-full text-center text-2xs'}
                amount={apy.toNumber()}
                options={{ maxDecimals: 2, minDecimals: 2, suffix: '%', abbreviated: true }}
                animate
              />
            </div>
          </div>
          <div
            className={classNames(
              'grid relative z-2',
              !reduceMotion && 'transition-[grid-template-rows,opacity]',
              accountDetailsExpanded
                ? 'transition-[grid-template-rows,opacity] opacity-100 delay-200 duration-600 grid-rows-[1fr]'
                : 'transition-opacity opacity-0 duration-300 grid-rows-[0fr]',
            )}
          >
            <div className='overflow-x-scroll overflow-y-hidden md:overflow-hidden'>
              <AccountSummary account={account} />
            </div>
            <div
              className={classNames(
                'absolute inset-0 -z-1',
                'before:content-[""] before:transition-opacity before:-z-1 before:absolute before:left-0 before:h-full before:w-full before:bg-white/10 before:rounded-b-base before:border-t before:border-white/10',
                accountDetailsExpanded
                  ? 'before:opacity-100 before:delay-500 before:top-full'
                  : 'before:opacity-0 before:duration-0',
              )}
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
      </div>
    </>
  )
}
