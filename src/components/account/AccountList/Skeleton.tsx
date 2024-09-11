import { ORACLE_DENOM } from '../../../constants/oracle'
import { BNCoin } from '../../../types/classes/BNCoin'
import DisplayCurrency from '../../common/DisplayCurrency'
import { FormattedNumber } from '../../common/FormattedNumber'
import { ArrowChartLineUp } from '../../common/Icons'
import Loading from '../../common/Loading'
import Text from '../../common/Text'
import HealthBar from '../Health/HealthBar'
import HealthIcon from '../Health/HealthIcon'

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
          <HealthIcon isLoading={props.healthFactor === 0} health={props.health} className='w-4' />
          <Text size='xs' className='w-auto mr-1 text-white/70'>
            Health
          </Text>
          <HealthBar health={health} healthFactor={healthFactor} className='w-[92px] h-0.5' />
        </div>
      </div>
    </div>
  )
}
