import classNames from 'classnames'
import { useMemo } from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { Gauge } from 'components/Gauge'
import { ArrowRight, Heart } from 'components/Icons'
import Text from 'components/Text'
import { ORACLE_DENOM } from 'constants/oracle'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useHealthComputer from 'hooks/useHealthComputer'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountBalanceValue, calculateAccountLeverage } from 'utils/accounts'
import { formatLeverage } from 'utils/formatters'

export default function AccountDetailsController() {
  const account = useCurrentAccount()
  const address = useStore((s) => s.address)
  const focusComponent = useStore((s) => s.focusComponent)

  if (!account || !address || focusComponent) return null

  return <AccountDetails account={account} />
}

interface Props {
  account: Account
}

function AccountDetails(props: Props) {
  const updatedAccount = useStore((s) => s.updatedAccount)
  const { health } = useHealthComputer(props.account)
  const { health: updatedHealth } = useHealthComputer(updatedAccount)
  const { data: prices } = usePrices()
  const accountBalanceValue = calculateAccountBalanceValue(
    updatedAccount ? updatedAccount : props.account,
    prices,
  )
  const coin = BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, accountBalanceValue)
  const leverage = useMemo(
    () => calculateAccountLeverage(updatedAccount ? updatedAccount : props.account, prices),
    [props.account, updatedAccount, prices],
  )

  return (
    <div
      data-testid='account-details'
      className='w-16 rounded-base border border-white/20 bg-white/5 backdrop-blur-sticky'
    >
      <div className='flex w-full flex-wrap justify-center py-4'>
        <Gauge tooltip='Health Factor' percentage={health} icon={<Heart />} />
        <Text size='2xs' className='mb-0.5 mt-1 w-full text-center text-white/50'>
          Health
        </Text>
        <div className='flex'>
          <FormattedNumber
            className={'w-full text-center text-xs'}
            amount={health}
            options={{ maxDecimals: 1, minDecimals: 0 }}
            animate
          />
          {updatedHealth && health !== updatedHealth && (
            <>
              <ArrowRight
                width={16}
                className={classNames(health > updatedHealth ? 'text-loss' : 'text-success')}
              />
              <FormattedNumber
                className={'w-full text-center text-xs'}
                amount={updatedHealth}
                options={{ maxDecimals: 1, minDecimals: 0 }}
                animate
              />
            </>
          )}
        </div>
      </div>
      <div className='w-full border-t border-white/20 py-4'>
        <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
          Leverage
        </Text>
        <Text size='xs' className='text-center'>
          {formatLeverage(leverage.toNumber())}
        </Text>
      </div>
      <div className='w-full border-t border-white/20 py-4'>
        <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
          Net worth
        </Text>
        <DisplayCurrency coin={coin} className='w-full truncate text-center text-2xs ' />
      </div>
    </div>
  )
}
