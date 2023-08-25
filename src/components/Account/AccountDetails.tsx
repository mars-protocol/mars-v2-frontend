import classNames from 'classnames'
import { useMemo } from 'react'

import AccountBalancesTable from 'components/Account/AccountBalancesTable'
import AccountComposition from 'components/Account/AccountComposition'
import Card from 'components/Card'
import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { Gauge } from 'components/Gauge'
import { ChevronLeft, ChevronRight, Heart } from 'components/Icons'
import Text from 'components/Text'
import { ORACLE_DENOM } from 'constants/oracle'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useHealthComputer from 'hooks/useHealthComputer'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import usePrices from 'hooks/usePrices'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import {
  calculateAccountApr,
  calculateAccountBalanceValue,
  calculateAccountLeverage,
} from 'utils/accounts'

export default function AccountDetailsController() {
  const account = useCurrentAccount()
  const address = useStore((s) => s.address)
  const focusComponent = useStore((s) => s.focusComponent)

  if (!account || !address || focusComponent) return null

  return <AccountDetails account={account} />
}

interface Props {
  account: Account
}

function AccountDetails(props: Props) {
  const { account } = props
  const updatedAccount = useStore((s) => s.updatedAccount)
  const [isExpanded, setIsExpanded] = useToggle()
  const { health } = useHealthComputer(account)
  const { data: prices } = usePrices()
  const accountBalanceValue = useMemo(
    () => calculateAccountBalanceValue(updatedAccount ? updatedAccount : account, prices),
    [updatedAccount, account, prices],
  )
  const coin = BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, accountBalanceValue)
  const leverage = useMemo(
    () => calculateAccountLeverage(updatedAccount ? updatedAccount : account, prices),
    [account, updatedAccount, prices],
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
  const apr = useMemo(
    () => calculateAccountApr(account, borrowAssetsData, lendingAssetsData, prices),
    [account, borrowAssetsData, lendingAssetsData, prices],
  )
  return (
    <div
      data-testid='account-details'
      className={classNames(
        isExpanded ? 'right-6' : '-right-80',
        'w-100 flex items-start gap-6 absolute top-6',
        'transition-all duration-300',
      )}
    >
      <div
        className={classNames(
          'flex flex-wrap w-16 group/details relative',
          'border rounded-base border-white/20',
          'bg-white/5 backdrop-blur-sticky transition-colors duration-300',
          'hover:bg-white/20 hover:cursor-pointer ',
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          className={classNames(
            'absolute block opacity-0 top-1/2 transition-[opacity]',
            'group-hover/details:opacity-100 duration-300 delay-100',
            isExpanded ? '-right-4' : '-right-3',
          )}
        >
          {isExpanded ? <ChevronRight className='w-2' /> : <ChevronLeft className='w-2' />}
        </div>
        <div className='flex flex-wrap justify-center w-full py-4'>
          <Gauge tooltip='Health Factor' percentage={health} icon={<Heart />} />
          <Text size='2xs' className='mb-0.5 mt-1 w-full text-center text-white/50'>
            Health
          </Text>
          <div className='flex'>
            <FormattedNumber
              className={'w-full text-center text-xs'}
              amount={health}
              options={{ maxDecimals: 0, minDecimals: 0, suffix: '%' }}
              animate
            />
          </div>
        </div>
        <div className='w-full py-4 border-t border-white/20'>
          <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
            Leverage
          </Text>
          <FormattedNumber
            className={'w-full text-center text-2xs'}
            amount={leverage.toNumber()}
            options={{ maxDecimals: 2, minDecimals: 2, suffix: 'x' }}
            animate
          />
        </div>
        <div className='w-full py-4 border-t border-white/20'>
          <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
            Net worth
          </Text>
          <DisplayCurrency coin={coin} className='w-full text-center truncate text-2xs ' />
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
      </div>
      <div className='flex w-80 backdrop-blur-sticky'>
        <Card className='w-full bg-white/5' title={`Account ${account.id}`}>
          <AccountComposition account={account} />
          <Text className='w-full px-4 py-2 bg-white/10 text-white/40'>Balances</Text>
          <AccountBalancesTable
            account={account}
            borrowingData={borrowAssetsData}
            lendingData={lendingAssetsData}
          />
        </Card>
      </div>
    </div>
  )
}
