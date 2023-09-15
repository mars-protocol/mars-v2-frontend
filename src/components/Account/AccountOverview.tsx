import classNames from 'classnames'
import { Suspense, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import AccountBalancesTable from 'components/Account/AccountBalancesTable'
import AccountComposition from 'components/Account/AccountComposition'
import AccountCreateFirst from 'components/Account/AccountCreateFirst'
import Button from 'components/Button'
import Card from 'components/Card'
import { PlusCircled } from 'components/Icons'
import Loading from 'components/Loading'
import Text from 'components/Text'
import WalletBridges from 'components/Wallet/WalletBridges'
import WalletConnectButton from 'components/Wallet/WalletConnectButton'
import useAccounts from 'hooks/useAccounts'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useCurrentWalletBalance from 'hooks/useCurrentWalletBalance'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import useStore from 'store'
import { defaultFee } from 'utils/constants'
import { BN } from 'utils/helpers'

function ConnectInfo() {
  return (
    <Card
      className='w-full h-fit bg-white/5'
      title='Portfolio'
      contentClassName='px-4 py-6 flex justify-center flex-wrap'
    >
      <Text size='sm' className='w-full text-center'>
        You need to be connected to view the porfolio page.
      </Text>
      <WalletConnectButton className='mt-4' />
    </Card>
  )
}

function Content() {
  const { address: urlAddress } = useParams()
  const { data: accounts, isLoading } = useAccounts(urlAddress ?? '')
  const walletAddress = useStore((s) => s.address)
  const baseCurrency = useStore((s) => s.baseCurrency)
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
  const transactionFeeCoinBalance = useCurrentWalletBalance(baseCurrency.denom)

  const checkHasFunds = useCallback(() => {
    return (
      transactionFeeCoinBalance &&
      BN(transactionFeeCoinBalance.amount).isGreaterThan(defaultFee.amount[0].amount)
    )
  }, [transactionFeeCoinBalance])

  const handleCreateAccountClick = useCallback(() => {
    if (!checkHasFunds()) {
      useStore.setState({ focusComponent: { component: <WalletBridges /> } })
      return
    }

    useStore.setState({ focusComponent: { component: <AccountCreateFirst /> } })
  }, [checkHasFunds])

  if (isLoading) return <Fallback />

  if (!walletAddress && !urlAddress) return <ConnectInfo />

  if (!accounts || accounts.length === 0)
    return (
      <Card
        className='w-full h-fit bg-white/5'
        title='Portfolio'
        contentClassName='px-4 py-6 flex justify-center flex-wrap'
      >
        <Text size='sm' className='w-full text-center'>
          You need to create an Account first.
        </Text>
        <Button
          className='mt-4'
          onClick={handleCreateAccountClick}
          leftIcon={<PlusCircled />}
          color='primary'
        >
          Create Account
        </Button>
      </Card>
    )

  return (
    <div
      className={classNames('grid w-full grid-cols-1 gap-4', 'md:grid-cols-2', 'lg:grid-cols-3')}
    >
      {accounts.map((account: Account, index: number) => (
        <Card
          className='w-full h-fit bg-white/5'
          title={`Credit Account ${account.id}`}
          key={index}
        >
          <AccountComposition account={account} />
          <Text className='w-full px-4 py-2 text-white bg-white/10'>Balances</Text>
          <AccountBalancesTable
            account={account}
            borrowingData={borrowAssetsData}
            lendingData={lendingAssetsData}
          />
        </Card>
      ))}
    </div>
  )
}

function Fallback() {
  const { address } = useParams()
  const cardCount = 3
  if (!address) return <ConnectInfo />
  return (
    <div
      className={classNames('grid w-full grid-cols-1 gap-4', 'md:grid-cols-2', 'lg:grid-cols-3')}
    >
      {Array.from({ length: cardCount }, (_, i) => (
        <Card key={i} className='w-full h-fit bg-white/5' title='Account' contentClassName='py-6'>
          <div className='p-4'>
            <Loading className='h-4 w-50' />
          </div>
          <Text className='w-full px-4 py-2 mt-3 text-white bg-white/10'>Balances</Text>
          <Loading className='w-full h-4' />
        </Card>
      ))}
    </div>
  )
}

export default function AccountOverview() {
  return (
    <Suspense fallback={<Fallback />}>
      <Content />
    </Suspense>
  )
}
