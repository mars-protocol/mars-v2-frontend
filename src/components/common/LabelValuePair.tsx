import classNames from 'classnames'

import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import { BN } from 'utils/helpers'

interface ValueData extends FormattedNumberProps {
  format?: 'number' | 'string'
}

interface Props {
  label: string
  value: ValueData
  className?: string
}

export const LabelValuePair = ({ label, value, className }: Props) => (
  <div className={classNames('flex w-full', className)}>
    <Text size='xs' className='flex-1 text-white/60'>
      {label}
    </Text>
    <Text size='xs' className='text-white/60'>
      {value.format === 'number' ? (
        <FormattedNumber {...value} amount={BN(value.amount).toNumber()} />
      ) : (
        value.amount || ''
      )}
    </Text>
  </div>
)
