import { FormattedNumber } from 'components/common/FormattedNumber'
import { InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'

interface Props {
  fee: number
}
export default function FeeTag(props: Props) {
  const { fee } = props

  return (
    <div className='flex items-center gap-1'>
      <Text tag='span' className='rounded-sm px-2 py-0.5 bg-white/10 text-white/60' size='xs'>
        <FormattedNumber
          amount={fee}
          options={{ minDecimals: 0, maxDecimals: 0, suffix: '% Fee' }}
          className='text-xs'
        />
      </Text>
      <Tooltip
        type='info'
        content={
          <div className='flex flex-col gap-2 max-w-xs'>
            <Text size='sm' className='font-semibold'>
              Performance Fee
            </Text>
            <Text size='xs' className='text-white/80'>
              Annualized performance fee is calculated on realized profits only (not your total
              investment). <br />
              Managers are permitted to adjust fees monthly.
            </Text>
          </div>
        }
      >
        <div className='inline-block w-3 h-3 hover:cursor-help opacity-60 hover:opacity-100 transition-opacity'>
          <InfoCircle />
        </div>
      </Tooltip>
    </div>
  )
}
