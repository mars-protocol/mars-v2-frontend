import { Suspense, useEffect } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import AccountCreateFirst from 'components/account/AccountCreateFirst'
import { CircularProgress } from 'components/common/CircularProgress'
import FullOverlayContent from 'components/common/FullOverlayContent'
import useAccountId from 'hooks/accounts/useAccountId'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
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
  const isV1 = useStore((s) => s.isV1)
  const { data: accountIds, isLoading: isLoadingAccounts } = useAccountIds(address || '', true)
  const { pathname } = useLocation()

  if (isLoadingAccounts) return <FetchLoading />
  if (
    accountIds &&
    accountIds.length === 0 &&
    !isV1 &&
    !pathname.includes('/vaults') &&
    !pathname.includes('/vaults-community')
  )
    return <AccountCreateFirst />
  if (!isLoadingAccounts && accountIds)
    return <FetchedBalances accountIds={accountIds} isV1={isV1} address={address} />
  return <FetchLoading />
}

export default function WalletFetchBalancesAndAccounts() {
  return (
    <Suspense fallback={<FetchLoading />}>
      <Content />
    </Suspense>
  )
}

function FetchedBalances({
  accountIds,
  isV1,
  address,
}: {
  accountIds: string[]
  isV1: boolean
  address?: string
}) {
  const [searchParams] = useSearchParams()
  const { address: urlAddress, vaultAddress: urlVaultAddress } = useParams()
  const urlAccountId = useAccountId()
  const chainConfig = useChainConfig()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const page = getPage(pathname, chainConfig)
  useEffect(() => {
    if (
      (page.startsWith('vaults/') || page === 'portfolio') &&
      urlAddress &&
      urlAddress !== address
    ) {
      navigate(getRoute(page, searchParams, urlAddress as string))
    } else {
      const currentAccountIsHls = urlAccountId && !accountIds.includes(urlAccountId)
      const currentAccount = currentAccountIsHls || !urlAccountId ? accountIds[0] : urlAccountId

      navigate(getRoute(page, searchParams, address, isV1 ? undefined : currentAccount), {
        replace: true,
      })
    }
    useStore.setState({ focusComponent: null })
  }, [
    accountIds,
    address,
    isV1,
    navigate,
    page,
    searchParams,
    urlAccountId,
    urlAddress,
    urlVaultAddress,
  ])

  return <FetchLoading />
}
