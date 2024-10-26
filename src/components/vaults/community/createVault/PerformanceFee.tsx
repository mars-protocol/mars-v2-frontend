import Button from 'components/common/Button'
import classNames from 'classnames'
import NumberInput from 'components/common/NumberInput'
import Text from 'components/common/Text'
import { Callout, CalloutType } from 'components/common/Callout'
import { useState } from 'react'
import { TextLink } from 'components/common/TextLink'
import { ExternalLink } from 'components/common/Icons'
import { BN } from 'utils/helpers'
import { BN_ZERO } from 'constants/math'

const fees = [
  { label: '1%', value: BN(1) },
  { label: '2%', value: BN(2) },
  { label: '5%', value: BN(5) },
  { label: '10%', value: BN(10) },
  { label: '15%', value: BN(15) },
  { label: '20%', value: BN(20) },
]

export default function PerformanceFee() {
  const [feeValue, setFeeValue] = useState<BigNumber>(BN(1))

  const handleFeeClick = (
    fee: BigNumber,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault()
    setFeeValue(fee)
  }

  return (
    <div className='w-full mb-6 space-y-3'>
      <Text size='xs' className='flex items-center'>
        Specify your performance fee
      </Text>
      <NumberInput
        amount={feeValue}
        onChange={(value) => setFeeValue(value)}
        asset={{ decimals: 0, symbol: '%' }}
        maxDecimals={0}
        min={BN_ZERO}
        max={BN(50)}
        maxLength={2}
        suffix='%'
        placeholder='Enter fee'
        className='px-4 py-3 rounded-sm bg-white/5 !border-solid border border-white/10 focus:border-white/20 focus:bg-white/10 !text-left'
      />
      <div className='flex gap-2 justify-evenly'>
        {fees.map((fee, index) => (
          <Button
            onClick={(event) => handleFeeClick(fee.value, event)}
            variant='solid'
            color='secondary'
            size='sm'
            className={classNames('w-full min-w-0', feeValue.isEqualTo(fee.value) && 'bg-white/20')}
            text={fee.label}
            key={index}
          />
        ))}
      </div>
      <Callout type={CalloutType.INFO}>
        Performance fees are capped at 50%.
        {/* TODO add link */}
        <TextLink
          href={''}
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
