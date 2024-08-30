import classNames from 'classnames'
import { ReactNode, useMemo } from 'react'
import { NavLink, useParams, useSearchParams } from 'react-router-dom'

import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import Skeleton from 'components/portfolio/Card/Skeleton'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAccount from 'hooks/accounts/useAccount'
import useAccountId from 'hooks/accounts/useAccountId'
import useAstroLpAprs from 'hooks/astroLp/useAstroLpAprs'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useHLSStakingAssets from 'hooks/hls/useHLSStakingAssets'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import { getAccountSummaryStats } from 'utils/accounts'
import { getRoute } from 'utils/route'
import useChainConfig from 'hooks/chain/useChainConfig'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'

interface Props {
  accountId: string
}

export default function PortfolioCard(props: Props) {
  const chainConfig = useChainConfig()
  const { data: account } = useAccount(props.accountId)
  const { health, healthFactor } = useHealthComputer(account)
  const { address: urlAddress } = useParams()
  const astroLpAprs = useAstroLpAprs()
  const currentAccountId = useAccountId()
  const { allAssets: lendingAssets } = useLendingMarketAssetsTableData()
  const data = useBorrowMarketAssetsTableData()
  const { data: hlsStrategies } = useHLSStakingAssets()
  const { data: vaultAprs } = useVaultAprs()
  const [searchParams] = useSearchParams()
  const assets = useWhitelistedAssets()
  const borrowAssets = useMemo(() => data?.allAssets || [], [data])
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )

  const { netWorth, apr, leverage } = getAccountSummaryStats(
    account as Account,
    borrowAssets,
    lendingAssets,
    hlsStrategies,
    assets,
    vaultAprs,
    astroLpAprs,
  )

  const stats: { title: ReactNode; sub: string }[] = useMemo(() => {
    const isLoaded = account && assets.length && apr !== null
    return [
      {
        title: isLoaded ? (
          <FormattedNumber amount={netWorth.amount.toNumber()} options={{ prefix: '$' }} />
        ) : (
          <Loading />
        ),
        sub: 'Net worth',
      },
      {
        title: isLoaded ? (
          <FormattedNumber amount={leverage.toNumber() || 1} options={{ suffix: 'x' }} />
        ) : (
          <Loading />
        ),
        sub: 'Leverage',
      },
      {
        title: isLoaded ? (
          <FormattedNumber amount={apr.toNumber()} options={{ suffix: '%' }} />
        ) : (
          <Loading />
        ),
        sub: 'APR',
      },
    ]
  }, [account, assets, apr, leverage, netWorth])

  if (!account) {
    return (
      <Skeleton
        stats={stats}
        health={health}
        healthFactor={healthFactor}
        accountId={props.accountId}
      />
    )
  }

  return (
    <NavLink
      to={getRoute(
        `portfolio/${props.accountId}` as Page,
        searchParams,
        urlAddress,
        currentAccountId,
      )}
      className={classNames('w-full hover:bg-white/5', !reduceMotion && 'transition-all')}
    >
      <Skeleton
        stats={stats}
        health={health}
        healthFactor={healthFactor}
        accountId={props.accountId}
        isCurrent={props.accountId === currentAccountId}
        isHls={account.kind === 'high_levered_strategy'}
      />
    </NavLink>
  )
}
