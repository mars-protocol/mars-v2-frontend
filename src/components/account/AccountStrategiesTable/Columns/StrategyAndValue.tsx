import classNames from 'classnames'

import { getSizeChangeColor } from 'components/account/AccountStrategiesTable/functions'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Text from 'components/common/Text'
import { ORACLE_DENOM } from 'constants/oracle'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export const STRATEGY_AND_VALUE_META = {
  header: 'Strategy & Value',
  id: 'name',
  meta: { className: 'w-40 min-w-40' },
}

interface Props {
  name: string
  value: string
  coinsChange: AccountStrategyRow['coinsChange']
}

export default function StrategyAndValue(props: Props) {
  const { name, value, coinsChange } = props
  const color = getSizeChangeColor(coinsChange)
  const coin = BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, BN(value))

  return (
    <div className='flex flex-wrap'>
      <Text size='xs' className='w-full text-white opacity-60'>
        {name}
      </Text>
      <DisplayCurrency
        coin={coin}
        className={classNames('text-xs text-right', color)}
        options={{ abbreviated: false }}
        showZero
      />
    </div>
  )
}
