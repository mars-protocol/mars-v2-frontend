import classNames from 'classnames'
import { useCallback } from 'react'
import { useParams } from 'react-router-dom'

import AccountCreateFirst from 'components/account/AccountCreateFirst'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import { PlusCircled } from 'components/common/Icons'
import Text from 'components/common/Text'
import PortfolioCard from 'components/portfolio/Card'
import ConnectInfo from 'components/portfolio/Overview/ConnectInfo'
import WalletBridges from 'components/Wallet/WalletBridges'
import useHasFundsForTxFee from 'hooks/wallet/useHasFundsForTxFee'
import useStore from 'store'

interface Props {
  isLoading: boolean
  accountIds: string[]
  kind: AccountKind | 'fund_manager'
}

export default function AccountsOverview(props: Props) {
  const { isLoading, accountIds, kind } = props
  const isDefault = props.kind === 'default'
  const { address: urlAddress } = useParams()
  const walletAddress = useStore((s) => s.address)

  const hasFundsForTxFee = useHasFundsForTxFee()

  const handleCreateAccountClick = useCallback(() => {
    if (!hasFundsForTxFee) {
      useStore.setState({ focusComponent: { component: <WalletBridges /> } })
      return
    }

    useStore.setState({ focusComponent: { component: <AccountCreateFirst /> } })
  }, [hasFundsForTxFee])

  if (!walletAddress && !urlAddress) return <ConnectInfo />
  const isLoadedButEmtpy =
    !isLoading && accountIds && accountIds.length === 0 && urlAddress === walletAddress

  if (isLoadedButEmtpy && !isDefault) return null
  if (isLoadedButEmtpy && isDefault) {
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
  let title = 'Credit Accounts'
  if (kind === 'high_levered_strategy') title = 'High Leverage Strategy Accounts'
  if (kind === 'fund_manager') title = 'Vault Accounts'

  return (
    <div className='w-full mt-4'>
      <Text size='2xl' className='mb-8'>
        {title}
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
