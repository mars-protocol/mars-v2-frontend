import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'

interface Props {
  items: { title: string; amount: number }[]
}

export default function AprBreakdown(props: Props) {
  return (
    <div className='flex flex-col gap-2 w-[242px] p-3'>
      {props.items.map((item) => (
        <div key={item.title} className='flex justify-between'>
          <Text className='text-white/60 text-sm'>{item.title}</Text>
          <FormattedNumber
            amount={item.amount}
            className='text-sm'
            options={{ suffix: '%', maxDecimals: 2, minDecimals: 2 }}
          />
        </div>
      ))}
    </div>
  )
}
