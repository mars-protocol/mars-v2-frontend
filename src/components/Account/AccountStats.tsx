import AccountHealth from 'components/Account/AccountHealth'
import DisplayCurrency from 'components/DisplayCurrency'
import { ORACLE_DENOM } from 'constants/oracle'
import useHealthComputer from 'hooks/useHealthComputer'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountDepositsValue } from 'utils/accounts'
import { formatHealth } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  account: Account
}

export default function AccountStats(props: Props) {
  const { data: prices } = usePrices()
  const positionBalance = calculateAccountDepositsValue(props.account, prices)
  const { health } = useHealthComputer(props.account)
  const healthFactor = BN(100).minus(formatHealth(health)).toNumber()
  return (
    <div className='w-full flex-wrap'>
      <DisplayCurrency
        coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, positionBalance)}
        className='w-full text-xl'
      />
      <div className='mt-1 flex w-full items-center'>
        <AccountHealth health={healthFactor} classNames='w-[140px]' hasLabel />
      </div>
    </div>
  )
}
