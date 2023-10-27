import classNames from 'classnames'

import HealthBar from 'components/Account/HealthBar'
import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { ArrowChartLineUp, Heart } from 'components/Icons'
import Loading from 'components/Loading'
import Text from 'components/Text'
import { ORACLE_DENOM } from 'constants/oracle'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  health: number
  healthFactor: number
  positionBalance: BigNumber | null
  apr: BigNumber | null
}

export default function Skeleton(props: Props) {
  const { positionBalance, apr, health, healthFactor } = props
  return (
    <div className='flex flex-wrap w-full'>
      {positionBalance ? (
        <DisplayCurrency
          coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, positionBalance)}
          className='w-full text-xl'
        />
      ) : (
        <Loading className='h-6 mt-1 w-30' />
      )}

      <div className='flex items-center justify-between w-full mt-1'>
        <div className='flex items-center'>
          <ArrowChartLineUp className='w-4 mr-1' />
          {apr ? (
            <FormattedNumber
              className='text-xs text-white/70'
              amount={apr.toNumber()}
              options={{ prefix: 'APR: ', suffix: '%', minDecimals: 2, maxDecimals: 2 }}
            />
          ) : (
            <Loading className='h-4 w-18' />
          )}
        </div>
        <div className='flex items-center gap-1'>
          <Heart
            className={classNames(
              health <= 5 ? 'text-loss' : 'text-white',
              health <= 5 && 'animate-pulse',
              'w-4',
            )}
          />
          <Text size='xs' className='w-auto mr-1 text-white/70'>
            Health
          </Text>
          <HealthBar
            health={health}
            healthFactor={healthFactor}
            className='w-[92px] h-0.5'
            hasLabel
          />
        </div>
      </div>
    </div>
  )
}
