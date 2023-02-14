import classNames from 'classnames'
import { Text } from 'components/Text'
import { FormattedNumber } from './FormattedNumber'

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
    <Text size='xs' className='flex-grow text-white/60'>
      {label}
    </Text>
    <Text size='xs' className='text-white/60'>
      {value.format === 'number' ? <FormattedNumber animate {...value} /> : value.amount || ''}
    </Text>
  </div>
)
