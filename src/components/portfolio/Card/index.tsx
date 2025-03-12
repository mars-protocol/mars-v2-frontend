import classNames from 'classnames'
import { ReactNode, useMemo } from 'react'
import { NavLink, useParams, useSearchParams } from 'react-router-dom'

import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import Skeleton from 'components/portfolio/Card/Skeleton'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAccount from 'hooks/accounts/useAccount'
import useAccountId from 'hooks/accounts/useAccountId'
import { useAccountSummaryStats } from 'hooks/accounts/useAccountSummaryStats'
import useAccountTitle from 'hooks/accounts/useAccountTitle'
import useChainConfig from 'hooks/chain/useChainConfig'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'
import { checkAccountKind } from 'utils/accounts'
import { getRoute } from 'utils/route'
import { VaultDetailsContent } from 'components/managedVaults/community/vaultDetails'

interface Props {
  accountId: string
}

export default function PortfolioCard(props: Props) {
  const chainConfig = useChainConfig()
  const { data: account } = useAccount(props.accountId)
  const { health, healthFactor } = useHealthComputer(account)
  const { address: urlAddress } = useParams()
  const currentAccountId = useAccountId()
  const [searchParams] = useSearchParams()
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )
  const { netWorth, apy, leverage } = useAccountSummaryStats(account)

  const vaultTitle = useAccountTitle(account)

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
    return (
      <Skeleton
        stats={stats}
        health={health}
        healthFactor={healthFactor}
        accountId={props.accountId}
      />
    )
  }
  const isVault = checkAccountKind(account.kind) === 'fund_manager'
  const vaultAddress =
    typeof account.kind === 'object' && 'fund_manager' in account.kind
      ? account.kind.fund_manager.vault_addr
      : ''

  const handleClick = (e: React.MouseEvent) => {
    if (isVault && vaultAddress) {
      e.preventDefault()
      useStore.setState({
        focusComponent: {
          component: <VaultDetailsContent vaultAddress={vaultAddress} />,
          onClose: () => {},
        },
      })
    }
  }

  const route = getRoute(
    `portfolio/${props.accountId}` as Page,
    searchParams,
    urlAddress,
    currentAccountId,
  )

  return (
    <NavLink
      to={route}
      onClick={handleClick}
      className={classNames('w-full hover:bg-white/5', !reduceMotion && 'transition-all')}
    >
      <Skeleton
        stats={stats}
        health={health}
        healthFactor={healthFactor}
        accountId={props.accountId}
        isCurrent={props.accountId === currentAccountId}
        isHls={account.kind === 'high_levered_strategy'}
        isVault={isVault}
        vaultTitle={vaultTitle}
      />
    </NavLink>
  )
}
