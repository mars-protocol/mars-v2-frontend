import HealthBar from 'components/account/Health/HealthBar'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'

export const ACCOUNT_META = {
  id: 'account',
  header: 'Account',
  accessorKey: 'id',
  meta: { className: 'w-30' },
}
interface Props {
  account: HlsAccountWithStrategy
}

export default function Name(props: Props) {
  const { health, healthFactor } = useHealthComputer(props.account)
  return (
    <TitleAndSubCell
      title={`Account ${props.account.id}`}
      sub={
        <HealthBar
          health={health}
          healthFactor={healthFactor}
          showIcon
          height='10'
          iconClassName='mr-0.5 w-3'
        />
      }
    />
  )
}
