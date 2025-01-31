import HealthBar from 'components/account/Health/HealthBar'
import HealthIcon from 'components/account/Health/HealthIcon'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ArrowChartLineUp, Shield } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import { ORACLE_DENOM } from 'constants/oracle'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  health: number
  healthFactor: number
  positionBalance: BigNumber | null
  apy: BigNumber | null
  risk?: number
  isVault?: boolean
}

export default function Skeleton(props: Props) {
  const { apy, health, healthFactor, isVault, positionBalance, risk } = props
  return (
    <div className='flex flex-wrap w-full'>
      {positionBalance ? (
        <DisplayCurrency
          coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, positionBalance)}
          options={{ abbreviated: false }}
          className='w-full text-xl'
        />
      ) : (
        <Loading className='h-6 mt-1 w-30' />
      )}

      <div className='flex items-center justify-between w-full mt-1'>
        <div className='flex items-center'>
          {isVault ? (
            <>
              <Shield className='w-3 mr-1' />
              {risk ? (
                <Text size='2xs' className='text-white/70'>
                  Risk score: {risk}/100
                </Text>
              ) : (
                <Loading className='h-4 w-18' />
              )}
            </>
          ) : (
            <>
              <ArrowChartLineUp className='w-4 mr-1' />
              {apy ? (
                <FormattedNumber
                  className='text-xs text-white/70'
                  amount={apy.toNumber()}
                  options={{
                    prefix: 'APY: ',
                    suffix: '%',
                    minDecimals: 2,
                    maxDecimals: 2,
                    abbreviated: true,
                  }}
                />
              ) : (
                <Loading className='h-4 w-18' />
              )}
            </>
          )}
        </div>
        <div className='flex items-center gap-1'>
          <HealthIcon isLoading={healthFactor === 0} health={health} className='w-4' />
          <Text size='xs' className='w-auto mr-1 text-white/70'>
            Health
          </Text>
          <HealthBar health={health} healthFactor={healthFactor} className='w-[92px] h-0.5' />
        </div>
      </div>
    </div>
  )
}
