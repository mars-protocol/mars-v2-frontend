import { Suspense, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import AccountCreateSelect from 'components/account/AccountCreateSelect'
import USDCAccountMintAndFund from 'components/account/USDCAccountMintAndFund'
import { CircularProgress } from 'components/common/CircularProgress'
import FullOverlayContent from 'components/common/FullOverlayContent'
import WalletBridges from 'components/Wallet/WalletBridges'
import useAccountId from 'hooks/accounts/useAccountId'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useBaseAsset from 'hooks/assets/useBaseAsset'
import useChainConfig from 'hooks/chain/useChainConfig'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import { getPage, getRoute } from 'utils/route'
import { getUSDCAccounts } from 'utils/accounts'

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

  const isUSDCPath = pathname.includes('/usdc')

  if (isLoadingAccounts || isLoadingBalances) return <FetchLoading />
  if (BN(baseBalance).isZero()) return <WalletBridges />

  if (accountIds && accountIds.length === 0 && !isV1) {
    if (isUSDCPath) {
      useStore.setState({
        focusComponent: {
          component: <USDCAccountMintAndFund />,
        },
      })
      return <FetchLoading />
    }
    return <AccountCreateSelect />
  }

  if (!isLoadingAccounts && !isLoadingBalances && accountIds)
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
  const { address: urlAddress } = useParams()
  const urlAccountId = useAccountId()
  const chainConfig = useChainConfig()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isUSDCPath = pathname.includes('/usdc')

  const page = getPage(pathname, chainConfig)

  useEffect(() => {
    if (page === 'portfolio' && urlAddress && urlAddress !== address) {
      navigate(getRoute(page, searchParams, urlAddress as string))
    } else {
      const currentAccountIsHls = urlAccountId && !accountIds.includes(urlAccountId)
      const currentAccount = currentAccountIsHls || !urlAccountId ? accountIds[0] : urlAccountId

      if (isUSDCPath && !isV1) {
        const checkUSDCAccounts = async () => {
          try {
            const usdcAccounts = await getUSDCAccounts(chainConfig, address || '')

            if (usdcAccounts.length > 0) {
              navigate(getRoute(page, searchParams, address, usdcAccounts[0].id), {
                replace: true,
              })
            } else {
              useStore.setState({
                focusComponent: {
                  component: <USDCAccountMintAndFund />,
                },
              })
            }
          } catch (error) {
            console.error('Error fetching USDC accounts:', error)
            navigate(getRoute(page, searchParams, address, isV1 ? undefined : currentAccount), {
              replace: true,
            })
          }
        }

        checkUSDCAccounts()
      } else {
        navigate(getRoute(page, searchParams, address, isV1 ? undefined : currentAccount), {
          replace: true,
        })
      }
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
    isUSDCPath,
    chainConfig,
  ])

  return <FetchLoading />
}
