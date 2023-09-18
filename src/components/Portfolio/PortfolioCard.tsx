import { ReactNode, useMemo } from 'react'
import { NavLink } from 'react-router-dom'

import HealthBar from 'components/Account/HealthBar'
import Card from 'components/Card'
import { FormattedNumber } from 'components/FormattedNumber'
import { Heart } from 'components/Icons'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import useHealthComputer from 'hooks/useHealthComputer'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { calculateAccountLeverage, getAccountPositionValues } from 'utils/accounts'
import { getRoute } from 'utils/route'

interface Props {
  account: Account
}

export default function PortfolioCard(props: Props) {
  const { health } = useHealthComputer(props.account)
  const { data: prices } = usePrices()
  const address = useStore((s) => s.address)

  const [deposits, lends, debts, vaults] = useMemo(
    () => getAccountPositionValues(props.account, prices),
    [prices, props.account],
  )

  const leverage = useMemo(
    () => calculateAccountLeverage(props.account, prices),
    [props.account, prices],
  )

  const stats: { title: ReactNode; label: string }[] = useMemo(() => {
    return [
      {
        title: (
          <FormattedNumber
            amount={deposits.plus(lends).plus(vaults).minus(debts).toNumber()}
            options={{ prefix: '$' }}
          />
        ),
        label: 'Net worth',
      },
      {
        title: <FormattedNumber amount={leverage.toNumber()} options={{ suffix: 'x' }} />,
        label: 'Leverage',
      },
      {
        title: <FormattedNumber amount={debts.toNumber()} options={{ prefix: '$' }} />,
        label: 'Liabilities',
      },
    ]
  }, [debts, deposits, lends, leverage, vaults])

  return (
    <NavLink to={getRoute(`portfolio/${props.account.id}` as Page, address, props.account.id)}>
      <Card className='bg-white/5 p-4'>
        <Text>Credit account {props.account.id}</Text>
        <div className='flex gap-4 mt-6'>
          {stats.map(({ title, label }) => (
            <TitleAndSubCell key={`${props.account.id}-${label}`} title={title} sub={label} />
          ))}
        </div>
        <div className='flex gap-1 mt-6'>
          <Heart width={20} />
          <HealthBar health={health} />
        </div>
      </Card>
    </NavLink>
  )
}
