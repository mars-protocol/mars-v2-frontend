import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { Gauge } from 'components/Gauge'
import { Heart } from 'components/Icons'
import Text from 'components/Text'
import { ORACLE_DENOM } from 'constants/oracle'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useHealthComputer from 'hooks/useHealthComputer'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountBalanceValue } from 'utils/accounts'
import { formatHealth } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  account: Account
}

export default function AccountDetailsController() {
  const account = useCurrentAccount()
  const address = useStore((s) => s.address)
  const focusComponent = useStore((s) => s.focusComponent)

  if (!account || !address || focusComponent) return null

  return <AccountDetails account={account} />
}

function AccountDetails(props: Props) {
  const { health } = useHealthComputer(props.account)
  const { data: prices } = usePrices()
  const accountBalanceValue = calculateAccountBalanceValue(props.account, prices)
  const coin = BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, accountBalanceValue)
  const healthFactor = BN(100).minus(formatHealth(health)).toNumber()
  return (
    <div
      data-testid='account-details'
      className='w-16 rounded-base border border-white/20 bg-white/5 backdrop-blur-sticky'
    >
      <div className='flex w-full flex-wrap justify-center py-4'>
        <Gauge tooltip='Health Factor' percentage={healthFactor} icon={<Heart />} />
        <Text size='2xs' className='mb-0.5 mt-1 w-full text-center text-white/50'>
          Health
        </Text>
        <FormattedNumber
          className={'w-full text-center text-xs'}
          amount={healthFactor}
          options={{ maxDecimals: 0, minDecimals: 0 }}
          animate
        />
      </div>
      <div className='w-full border border-x-0 border-white/20 py-4'>
        <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
          Leverage
        </Text>
        <Text size='xs' className='w-full text-center'>
          4.5x
        </Text>
      </div>
      <div className='w-full px-1 py-4'>
        <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
          Balance
        </Text>
        <DisplayCurrency coin={coin} className='w-full truncate text-center text-2xs ' />
      </div>
    </div>
  )
}
