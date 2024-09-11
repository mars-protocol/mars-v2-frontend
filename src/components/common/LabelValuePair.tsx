import classNames from 'classnames'

import { BN } from 'utils/helpers'
import { FormattedNumber } from './FormattedNumber'
import Text from './Text'

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
        <FormattedNumber animate {...value} amount={BN(value.amount).toNumber()} />
      ) : (
        value.amount || ''
      )}
    </Text>
  </div>
)
