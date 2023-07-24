import { Suspense, useEffect, useMemo } from 'react'

import AccountCreateFirst from 'components/Account/AccountCreateFirst'
import { CircularProgress } from 'components/CircularProgress'
import FullOverlayContent from 'components/FullOverlayContent'
import WalletBridges from 'components/Wallet/WalletBridges'
import useAccounts from 'hooks/useAccounts'
import useWalletBalances from 'hooks/useWalletBalances'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { getBaseAsset } from 'utils/assets'
import { hardcodedFee } from 'utils/constants'
import { BN } from 'utils/helpers'

function FetchLoading() {
  return (
    <FullOverlayContent
      title='Fetching Wallet Data'
      copy='Please wait, while your wallet balances and accounts are beeing analyzed'
    >
      <CircularProgress size={40} />
    </FullOverlayContent>
  )
}

function Content() {
  const address = useStore((s) => s.address)
  const { data: accounts } = useAccounts(address)
  const { data: walletBalances, isLoading } = useWalletBalances(address)
  const baseAsset = getBaseAsset()

  const baseBalance = useMemo(
    () => walletBalances.find(byDenom(baseAsset.denom))?.amount ?? '0',
    [walletBalances, baseAsset],
  )

  useEffect(() => {
    if (
      accounts.length !== 0 &&
      BN(baseBalance).isGreaterThanOrEqualTo(hardcodedFee.amount[0].amount)
    ) {
      useStore.setState({ accounts: accounts, balances: walletBalances, focusComponent: null })
    }
  }, [accounts, walletBalances, baseBalance])

  if (isLoading) return <FetchLoading />
  if (BN(baseBalance).isLessThan(hardcodedFee.amount[0].amount)) return <WalletBridges />
  if (accounts.length === 0) return <AccountCreateFirst />
  return null
}

export default function WalletFetchBalancesAndAccounts() {
  return (
    <Suspense fallback={<FetchLoading />}>
      <Content />
    </Suspense>
  )
}
