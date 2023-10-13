import { Suspense, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import AccountCreateFirst from 'components/Account/AccountCreateFirst'
import { CircularProgress } from 'components/CircularProgress'
import FullOverlayContent from 'components/FullOverlayContent'
import WalletBridges from 'components/Wallet/WalletBridges'
import useAccountIds from 'hooks/useAccountIds'
import useWalletBalances from 'hooks/useWalletBalances'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { getBaseAsset } from 'utils/assets'
import { defaultFee } from 'utils/constants'
import { BN } from 'utils/helpers'
import { getPage, getRoute } from 'utils/route'

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
  const { address: urlAddress } = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { data: accountIds, isLoading: isLoadingAccounts } = useAccountIds(address || '')
  const { data: walletBalances, isLoading: isLoadingBalances } = useWalletBalances(address)
  const baseAsset = getBaseAsset()

  const baseBalance = useMemo(
    () => walletBalances.find(byDenom(baseAsset.denom))?.amount ?? '0',
    [walletBalances, baseAsset],
  )

  useEffect(() => {
    const page = getPage(pathname)
    if (page === 'portfolio' && urlAddress && urlAddress !== address) {
      navigate(getRoute(page, urlAddress as string))
      useStore.setState({ balances: walletBalances, focusComponent: null })
      return
    }

    if (
      accountIds &&
      accountIds.length !== 0 &&
      BN(baseBalance).isGreaterThanOrEqualTo(defaultFee.amount[0].amount)
    ) {
      navigate(getRoute(page, address, accountIds[0]))
      useStore.setState({ balances: walletBalances, focusComponent: null })
    }
  }, [accountIds, baseBalance, navigate, pathname, address, walletBalances, urlAddress])

  if (isLoadingAccounts || isLoadingBalances) return <FetchLoading />
  if (BN(baseBalance).isLessThan(defaultFee.amount[0].amount)) return <WalletBridges />
  if (accountIds && accountIds.length === 0) return <AccountCreateFirst />
  return null
}

export default function WalletFetchBalancesAndAccounts() {
  return (
    <Suspense fallback={<FetchLoading />}>
      <Content />
    </Suspense>
  )
}
