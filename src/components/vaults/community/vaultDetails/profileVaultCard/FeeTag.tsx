import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'

interface Props {
  fee: string
}
export default function FeeTag(props: Props) {
  const { fee } = props

  return (
    <Text tag='span' className='rounded-sm px-2 py-0.5 bg-white/10 text-white/60' size='xs'>
      <FormattedNumber
        amount={parseFloat(fee)}
        options={{ minDecimals: 0, maxDecimals: 1, suffix: '% Fee' }}
        className='text-xs'
        animate
      />
    </Text>
  )
}