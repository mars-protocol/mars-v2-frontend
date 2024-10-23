import { Suspense, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import AccountCreateFirst from 'components/account/AccountCreateFirst'
import { CircularProgress } from 'components/common/CircularProgress'
import FullOverlayContent from 'components/common/FullOverlayContent'
import WalletBridges from 'components/Wallet/WalletBridges'
import useAccountId from 'hooks/accounts/useAccountId'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useBaseAsset from 'hooks/assets/useBaseAsset'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import { getPage, getRoute } from 'utils/route'

function FetchLoading() {
  return (
    <FullOverlayContent
      title='Fetching Wallet Data'
      copy='Please wait, while your wallet balances and accounts are being analyzed'
    >
      <CircularProgress size={40} />
    </FullOverlayContent>
  )
}

function Content() {
  const address = useStore((s) => s.address)
  const [searchParams] = useSearchParams()
  const isV1 = useStore((s) => s.isV1)
  const { address: urlAddress } = useParams()
  const urlAccountId = useAccountId()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { data: accountIds, isLoading: isLoadingAccounts } = useAccountIds(
    address || '',
    true,
    true,
  )
  const { data: walletBalances, isLoading: isLoadingBalances } = useWalletBalances(address)
  const baseAsset = useBaseAsset()

  const baseBalance = useMemo(
    () => walletBalances.find(byDenom(baseAsset.denom))?.amount ?? '0',
    [walletBalances, baseAsset],
  )

  useEffect(() => {
    const page = getPage(pathname)

    if (page === 'portfolio' && urlAddress && urlAddress !== address) {
      navigate(getRoute(page, searchParams, urlAddress as string))
      useStore.setState({ balances: walletBalances, focusComponent: null })
      return
    }

    if (!accountIds || accountIds.length === 0) return

    const currentAccountIsHls = urlAccountId && !accountIds.includes(urlAccountId)
    const currentAccount = currentAccountIsHls || !urlAccountId ? accountIds[0] : urlAccountId

    navigate(getRoute(page, searchParams, address, isV1 ? undefined : currentAccount), {
      replace: true,
    })
    setTimeout(() => useStore.setState({ balances: walletBalances, focusComponent: null }), 500)
  }, [
    accountIds,
    navigate,
    pathname,
    address,
    walletBalances,
    urlAddress,
    urlAccountId,
    searchParams,
    isV1,
  ])

  if (isLoadingAccounts || isLoadingBalances) return <FetchLoading />
  if (BN(baseBalance).isZero()) return <WalletBridges />
  if (accountIds && accountIds.length === 0 && !isV1) return <AccountCreateFirst />
  return <FetchLoading />
}

export default function WalletFetchBalancesAndAccounts() {
  return (
    <Suspense fallback={<FetchLoading />}>
      <Content />
    </Suspense>
  )
}
