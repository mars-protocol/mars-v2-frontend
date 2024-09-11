import useHealthComputer from '../../../../../hooks/health-computer/useHealthComputer'
import HealthBar from '../../../../account/Health/HealthBar'
import TitleAndSubCell from '../../../../common/TitleAndSubCell'

export const ACCOUNT_META = {
  id: 'account',
  header: 'Account',
  accessorKey: 'id',
  meta: { className: 'w-30' },
}
interface Props {
  account: HlsAccountWithStakingStrategy
}

export default function Name(props: Props) {
  const { health, healthFactor } = useHealthComputer(props.account)
  return (
    <TitleAndSubCell
      className=''
      title={`Account ${props.account.id}`}
      sub={
        <HealthBar
          health={health}
          healthFactor={healthFactor}
          className=''
          showIcon
          height='10'
          iconClassName='mr-0.5 w-3'
        />
      }
    />
  )
}
