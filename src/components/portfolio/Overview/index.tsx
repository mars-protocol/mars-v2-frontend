import { useCallback } from 'react'
import { useParams } from 'react-router-dom'

import AccountCreateFirst from 'components/account/AccountCreateFirst'
import ConnectInfo from 'components/portfolio/Overview/ConnectInfo'
import WalletBridges from 'components/Wallet/WalletBridges'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useHasFundsForTxFee from 'hooks/wallet/useHasFundsForTxFee'
import useStore from 'store'
import AccountsOverview from './AccountsOverview'

export default function AccountSummary() {
  const { address: urlAddress } = useParams()
  const walletAddress = useStore((s) => s.address)
  const { data: defaultAccountIds, isLoading: defaultIsLoading } = useAccountIds(
    urlAddress,
    true,
    'default',
  )
  const { data: hlsAccountIds, isLoading: hlsIsLoading } = useAccountIds(
    urlAddress,
    true,
    'high_levered_strategy',
  )
  const { data: vaultAccountIds, isLoading: vaultIsLoading } = useAccountIds(
    urlAddress,
    true,
    'fund_manager',
  )

  const hasFundsForTxFee = useHasFundsForTxFee()

  const handleCreateAccountClick = useCallback(() => {
    if (!hasFundsForTxFee) {
      useStore.setState({ focusComponent: { component: <WalletBridges /> } })
      return
    }

    useStore.setState({ focusComponent: { component: <AccountCreateFirst /> } })
  }, [hasFundsForTxFee])

  if (!walletAddress && !urlAddress) return <ConnectInfo />

  return (
    <>
      <AccountsOverview
        isLoading={defaultIsLoading}
        accountIds={defaultAccountIds ?? []}
        kind='default'
      />
      <AccountsOverview
        isLoading={hlsIsLoading}
        accountIds={hlsAccountIds ?? []}
        kind='high_levered_strategy'
      />
      <AccountsOverview
        isLoading={vaultIsLoading}
        accountIds={vaultAccountIds ?? []}
        kind='fund_manager'
      />
    </>
  )
}
