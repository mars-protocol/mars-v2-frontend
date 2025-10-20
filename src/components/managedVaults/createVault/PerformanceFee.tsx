import classNames from 'classnames'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import { ExternalLink } from 'components/common/Icons'
import NumberInput from 'components/common/NumberInput'
import Text from 'components/common/Text'
import { TextLink } from 'components/common/TextLink'
import { DocURL } from 'types/enums'
import { BN } from 'utils/helpers'

const fees = [
  { label: '1%', value: BN(1) },
  { label: '2%', value: BN(2) },
  { label: '5%', value: BN(5) },
  { label: '10%', value: BN(10) },
  { label: '15%', value: BN(15) },
  { label: '20%', value: BN(20) },
]

interface Props {
  value: BigNumber
  onChange: (fee: BigNumber) => void
}

export default function PerformanceFee(props: Props) {
  const { value, onChange } = props

  const handleFeeClick = (
    fee: BigNumber,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault()
    onChange(fee)
  }

  return (
    <div className='w-full mt-2 mb-6 space-y-3'>
      <Text size='xs' className='flex items-center'>
        Specify your performance fee
      </Text>
      <NumberInput
        amount={value}
        onChange={onChange}
        asset={{ decimals: 0, symbol: '%' }}
        maxDecimals={0}
        max={BN(40)}
        placeholder='Enter fee'
        className='px-4 py-3 rounded-sm bg-white/5 !border-solid border border-white/10 focus:border-white/20 focus: !text-left text-sm'
      />
      <div className='flex gap-2 justify-evenly'>
        {fees.map((fee, index) => (
          <Button
            onClick={(event) => handleFeeClick(fee.value, event)}
            color='secondary'
            className={classNames('w-full min-w-0', value.isEqualTo(fee.value) && 'bg-white/10')}
            text={fee.label}
            key={index}
          />
        ))}
      </div>
      <Callout type={CalloutType.INFO}>
        Performance fees are capped at 40%.
        <TextLink
          href={DocURL.PERFORMANCE_FEES_URL}
          target='_blank'
          textSize='extraSmall'
          className='ml-1 text-white/50 hover:text-white'
          title='Performance fees'
        >
          Learn more
          <ExternalLink className='ml-1 inline w-3' />
        </TextLink>
      </Callout>
    </div>
  )
}
