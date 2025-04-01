import { Suspense, useEffect } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import AccountCreateFirst from 'components/account/AccountCreateFirst'
import { CircularProgress } from 'components/common/CircularProgress'
import FullOverlayContent from 'components/common/FullOverlayContent'
import useAccountId from 'hooks/accounts/useAccountId'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useGasPrices from 'hooks/prices/useGasPrices'
import useFeeToken from 'hooks/wallet/useFeeToken'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { getAvailableFeeTokens } from 'utils/feeToken'
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
  const isV1 = useStore((s) => s.isV1)
  const { data: accountIds, isLoading: isLoadingAccounts } = useAccountIds(
    address || '',
    true,
    true,
  )
  if (isLoadingAccounts) return <FetchLoading />
  if (accountIds && accountIds.length === 0 && !isV1) return <AccountCreateFirst />
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
  const { address: urlAddress } = useParams()
  const urlAccountId = useAccountId()
  const chainConfig = useChainConfig()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { feeToken, setFeeToken } = useFeeToken()
  const page = getPage(pathname, chainConfig)
  const walletAddress = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(walletAddress)
  const { data: assets } = useAssets()
  const { data: gasPricesData } = useGasPrices()

  useEffect(() => {
    if (!gasPricesData || !feeToken || !walletBalances || walletBalances.length === 0) return

    const currentTokenBalance = walletBalances.find(
      (coin) => coin.denom === feeToken.coinMinimalDenom,
    )

    if (!currentTokenBalance || BN(currentTokenBalance.amount).isLessThanOrEqualTo(0)) {
      const availableFeeTokens = getAvailableFeeTokens(
        walletBalances,
        gasPricesData.prices,
        chainConfig,
        assets,
      )
      const currentToken = availableFeeTokens.find(
        (token) => token.token.coinMinimalDenom === feeToken.coinMinimalDenom,
      )?.token

      if (!currentToken && availableFeeTokens.length > 0) setFeeToken(availableFeeTokens[0].token)
      if (
        currentToken.coinMinimalDenom !== feeToken.coinMinimalDenom ||
        currentToken.gasPriceStep?.average !== feeToken.gasPriceStep?.average
      ) {
        setFeeToken(currentToken)
      }
    }

    if (page === 'portfolio' && urlAddress && urlAddress !== address) {
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
    feeToken?.coinMinimalDenom,
    isV1,
    navigate,
    page,
    searchParams,
    urlAccountId,
    urlAddress,
    walletBalances,
    feeToken,
    setFeeToken,
    gasPricesData,
    chainConfig,
    assets,
  ])

  return <FetchLoading />
}
