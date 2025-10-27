import { useParams } from 'react-router-dom'

import ConnectInfo from 'components/portfolio/Overview/ConnectInfo'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useStore from 'store'
import AccountsOverview from 'components/portfolio/Overview/AccountsOverview'
import LiquidationsOverview from 'components/portfolio/Overview/LiquidationsOverview'

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
  const allAccountIds = [
    ...(defaultAccountIds ?? []),
    ...(hlsAccountIds ?? []),
    ...(vaultAccountIds ?? []),
  ]

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
      <LiquidationsOverview accountIds={allAccountIds} />
    </>
  )
}
