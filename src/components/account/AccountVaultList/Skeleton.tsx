import HealthBar from 'components/account/Health/HealthBar'
import HealthIcon from 'components/account/Health/HealthIcon'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import { BNCoin } from 'types/classes/BNCoin'
import { ORACLE_DENOM } from 'constants/oracle'
import { Shield } from 'components/common/Icons'

interface Props {
  health: number
  healthFactor: number
  positionBalance: BigNumber | null
  risk: number
}

export default function Skeleton(props: Props) {
  const { positionBalance, risk, health, healthFactor } = props
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
          <Shield className='w-3 h-3 mr-1' />
          {risk ? (
            <Text size='2xs' className='text-white/70'>
              {/* TODO: fetch values */}
              Risk score: {risk}/100
            </Text>
          ) : (
            <Loading className='h-4 w-18' />
          )}
        </div>
        <div className='flex items-center gap-0.5'>
          <HealthIcon isLoading={healthFactor === 0} health={health} className='w-3 h-3 ' />
          <Text size='2xs' className='w-auto text-white/70'>
            Health
          </Text>
          <HealthBar health={health} healthFactor={healthFactor} className='w-24 h-0.5' />
        </div>
      </div>
    </div>
  )
}
