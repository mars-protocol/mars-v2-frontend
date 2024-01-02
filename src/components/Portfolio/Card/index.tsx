import classNames from 'classnames'
import { ReactNode, useMemo } from 'react'
import { NavLink, useParams, useSearchParams } from 'react-router-dom'

import { FormattedNumber } from 'components/FormattedNumber'
import Loading from 'components/Loading'
import Skeleton from 'components/Portfolio/Card/Skeleton'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useAccount from 'hooks/accounts/useAccount'
import useAllAssets from 'hooks/assets/useAllAssets'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useAccountId from 'hooks/useAccountId'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useHealthComputer from 'hooks/useHealthComputer'
import useHLSStakingAssets from 'hooks/useHLSStakingAssets'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import usePrices from 'hooks/usePrices'
import {
  calculateAccountApr,
  calculateAccountLeverage,
  getAccountPositionValues,
} from 'utils/accounts'
import { getRoute } from 'utils/route'

interface Props {
  accountId: string
}

export default function PortfolioCard(props: Props) {
  const { data: account } = useAccount(props.accountId)
  const { health, healthFactor } = useHealthComputer(account)
  const { address: urlAddress } = useParams()
  const { data: prices } = usePrices()
  const currentAccountId = useAccountId()
  const { allAssets: lendingAssets } = useLendingMarketAssetsTableData()
  const { data } = useBorrowMarketAssetsTableData(false)
  const { data: hlsStrategies } = useHLSStakingAssets()
  const [searchParams] = useSearchParams()
  const assets = useAllAssets()
  const borrowAssets = useMemo(() => data?.allAssets || [], [data])
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    DEFAULT_SETTINGS.reduceMotion,
  )

  const [deposits, lends, debts, vaults] = useMemo(() => {
    if (!prices.length || !account) return Array(4).fill(BN_ZERO)
    return getAccountPositionValues(account, prices, assets)
  }, [prices, account, assets])

  const leverage = useMemo(() => {
    if (!prices.length || !account) return BN_ZERO
    return calculateAccountLeverage(account, prices, assets)
  }, [account, assets, prices])

  const apr = useMemo(() => {
    if (!lendingAssets.length || !borrowAssets.length || !prices.length || !account) return null
    return calculateAccountApr(
      account,
      borrowAssets,
      lendingAssets,
      prices,
      hlsStrategies,
      assets,
      account.kind === 'high_levered_strategy',
    )
  }, [lendingAssets, borrowAssets, prices, account, hlsStrategies, assets])

  const stats: { title: ReactNode; sub: string }[] = useMemo(() => {
    const isLoaded = account && prices.length && apr !== null
    return [
      {
        title: isLoaded ? (
          <FormattedNumber
            amount={deposits.plus(lends).plus(vaults).minus(debts).toNumber()}
            options={{ prefix: '$' }}
          />
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
  }, [account, prices.length, deposits, lends, vaults, debts, leverage, apr])

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
