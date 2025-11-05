import classNames from 'classnames'
import { ReactNode, useMemo } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'

import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import Skeleton from 'components/portfolio/Card/Skeleton'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { useAccountSummaryStats } from 'hooks/accounts/useAccountSummaryStats'
import useChainConfig from 'hooks/chain/useChainConfig'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useUrlAddress from 'hooks/wallet/useUrlAddress'
import useV1Account from 'hooks/v1/useV1Account'
import useStore from 'store'
import { getRoute } from 'utils/route'

export default function V1PortfolioCard() {
  const chainConfig = useChainConfig()
  const urlAddress = useUrlAddress()
  const walletAddress = useStore((s) => s.address)
  const { data: account } = useV1Account(urlAddress || walletAddress)
  const { health, healthFactor } = useHealthComputer(account)
  const [searchParams] = useSearchParams()
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )
  const { netWorth, apy, leverage } = useAccountSummaryStats(account)

  const stats: { title: ReactNode; sub: string }[] = useMemo(() => {
    if (!account) {
      return [
        { title: <Loading />, sub: 'Net worth' },
        { title: <Loading />, sub: 'Leverage' },
        { title: <Loading />, sub: 'APY' },
      ]
    }

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
  }, [account, apy, leverage, netWorth])

  if (!account) {
    return null
  }

  const route = getRoute(`portfolio/v1` as Page, searchParams, urlAddress)

  return (
    <NavLink
      to={route}
      className={classNames('w-full hover:bg-white/5', !reduceMotion && 'transition-all')}
    >
      <Skeleton
        stats={stats}
        health={health}
        healthFactor={healthFactor}
        accountId='v1'
        isCurrent={false}
        vaultTitle='Red Bank v1'
      />
    </NavLink>
  )
}
