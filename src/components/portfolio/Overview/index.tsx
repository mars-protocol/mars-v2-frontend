import classNames from 'classnames'
import { useCallback } from 'react'
import { useParams } from 'react-router-dom'

import WalletBridges from 'components/Wallet/WalletBridges'
import AccountCreateFirst from 'components/account/AccountCreateFirst'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import { PlusCircled } from 'components/common/Icons'
import Text from 'components/common/Text'
import PortfolioCard from 'components/portfolio/Card'
import ConnectInfo from 'components/portfolio/Overview/ConnectInfo'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useBaseAsset from 'hooks/assets/useBasetAsset'
import useCurrentWalletBalance from 'hooks/useCurrentWalletBalance'
import useStore from 'store'
import { BN } from 'utils/helpers'

export default function AccountSummary() {
  const { address: urlAddress } = useParams()
  const walletAddress = useStore((s) => s.address)
  const { data: accountIds, isLoading } = useAccountIds(urlAddress)

  const baseAsset = useBaseAsset()
  const transactionFeeCoinBalance = useCurrentWalletBalance(baseAsset.denom)

  const checkHasFunds = useCallback(() => {
    return transactionFeeCoinBalance && !BN(transactionFeeCoinBalance.amount).isZero()
  }, [transactionFeeCoinBalance])

  const handleCreateAccountClick = useCallback(() => {
    if (!checkHasFunds()) {
      useStore.setState({ focusComponent: { component: <WalletBridges /> } })
      return
    }

    useStore.setState({ focusComponent: { component: <AccountCreateFirst /> } })
  }, [checkHasFunds])

  if (!walletAddress && !urlAddress) return <ConnectInfo />

  if (!isLoading && accountIds && accountIds.length === 0) {
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
  }

  return (
    <div className='w-full mt-4'>
      <Text size='2xl' className='mb-8'>
        Credit Accounts
      </Text>
      <div
        className={classNames('grid w-full grid-cols-1 gap-6', 'md:grid-cols-2', 'lg:grid-cols-3')}
      >
        {accountIds?.map((accountId: string, index: number) => {
          return <PortfolioCard key={accountId} accountId={accountId} />
        })}
      </div>
    </div>
  )
}
