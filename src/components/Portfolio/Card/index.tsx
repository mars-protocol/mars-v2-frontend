import { ReactNode, useMemo } from 'react'
import { NavLink } from 'react-router-dom'

import { FormattedNumber } from 'components/FormattedNumber'
import Loading from 'components/Loading'
import Skeleton from 'components/Portfolio/Card/Skeleton'
import { BN_ZERO } from 'constants/math'
import useAccount from 'hooks/useAccount'
import useAccountId from 'hooks/useAccountId'
import useHealthComputer from 'hooks/useHealthComputer'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { calculateAccountLeverage, getAccountPositionValues } from 'utils/accounts'
import { getRoute } from 'utils/route'

interface Props {
  accountId: string
}

export default function PortfolioCard(props: Props) {
  const { data: account } = useAccount(props.accountId)
  const { health } = useHealthComputer(account)
  const { data: prices } = usePrices()
  const currentAccountId = useAccountId()
  const address = useStore((s) => s.address)

  const [deposits, lends, debts, vaults] = useMemo(() => {
    if (!prices.length || !account) return Array(4).fill(BN_ZERO)
    return getAccountPositionValues(account, prices)
  }, [prices, account])

  const leverage = useMemo(() => {
    if (!prices.length || !account) return BN_ZERO
    return calculateAccountLeverage(account, prices)
  }, [account, prices])

  const stats: { title: ReactNode; sub: string }[] = useMemo(() => {
    const isLoaded = account && prices.length
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
          <FormattedNumber amount={leverage.toNumber()} options={{ suffix: 'x' }} />
        ) : (
          <Loading />
        ),
        sub: 'Leverage',
      },
      {
        title: isLoaded ? (
          <FormattedNumber amount={debts.toNumber()} options={{ prefix: '$' }} />
        ) : (
          <Loading />
        ),
        sub: 'Liabilities',
      },
    ]
  }, [debts, deposits, lends, leverage, prices.length, account, vaults])

  if (!account) {
    return <Skeleton stats={stats} health={health} accountId={props.accountId} />
  }
  return (
    <NavLink
      to={getRoute(`portfolio/${props.accountId}` as Page, address, currentAccountId)}
      className='w-full'
    >
      <Skeleton stats={stats} health={health} accountId={props.accountId} />
    </NavLink>
  )
}
