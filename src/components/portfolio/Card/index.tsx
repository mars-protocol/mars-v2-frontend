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
import useAssets from 'hooks/assets/useAssets'
import useAstroLpAprs from 'hooks/astroLp/useAstroLpAprs'
import useChainConfig from 'hooks/chain/useChainConfig'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useAssetParams from 'hooks/params/useAssetParams'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import { getAccountSummaryStats } from 'utils/accounts'
import { getRoute } from 'utils/route'

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
  const { data: vaultAprs } = useVaultAprs()
  const [searchParams] = useSearchParams()
  const { data: assets } = useAssets()
  const borrowAssets = useMemo(() => data?.allAssets || [], [data])
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )
  const assetParams = useAssetParams()

  const stats: { title: ReactNode; sub: string }[] = useMemo(() => {
    if (!account || !assets.length || !lendingAssets.length || !borrowAssets.length) {
      return [
        { title: <Loading />, sub: 'Net worth' },
        { title: <Loading />, sub: 'Leverage' },
        { title: <Loading />, sub: 'APY' },
      ]
    }
    const { netWorth, apy, leverage } = getAccountSummaryStats(
      account as Account,
      borrowAssets,
      lendingAssets,
      assets,
      vaultAprs,
      astroLpAprs,
      assetParams.data || [],
    )

    return [
      {
        title: <FormattedNumber amount={netWorth.amount.toNumber()} options={{ prefix: '$' }} />,
        sub: 'Net worth',
      },
      {
        title: <FormattedNumber amount={leverage.toNumber() || 1} options={{ suffix: 'x' }} />,
        sub: 'Leverage',
      },
      {
        title: <FormattedNumber amount={apy.toNumber()} options={{ suffix: '%' }} />,
        sub: 'APY',
      },
    ]
  }, [account, assets, borrowAssets, lendingAssets, vaultAprs, astroLpAprs, assetParams.data])

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
