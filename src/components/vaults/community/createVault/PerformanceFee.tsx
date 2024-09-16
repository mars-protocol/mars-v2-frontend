import Button from 'components/common/Button'
import VaultInputElement from 'components/vaults/community/createVault/VaultInputElement'
import classNames from 'classnames'
import { Callout, CalloutType } from 'components/common/Callout'
import { useState } from 'react'

const fees = [
  { label: '1%', value: '1' },
  { label: '2%', value: '2' },
  { label: '5%', value: '5' },
  { label: '10%', value: '10' },
  { label: '15%', value: '15' },
  { label: '20%', value: '20' },
]

export default function PerformanceFee() {
  const [feeValue, setFeeValue] = useState<string>('2')

  const handleFeeClick = (fee: string, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault()
    setFeeValue(fee)
  }

  return (
    <div className='w-full mb-6 space-y-3'>
      {/* TODO: add logic for max number for fees */}
      <VaultInputElement
        type='text'
        value={feeValue}
        onChange={(value) => setFeeValue(value)}
        label='Specify your performance fee'
        suffix='%'
        placeholder='Enter fee'
      />
      <div className='flex gap-2 justify-evenly'>
        {fees.map((fee, index) => (
          <Button
            onClick={(event) => handleFeeClick(fee.value, event)}
            variant='solid'
            color='tertiary'
            size='sm'
            className={classNames('w-full min-w-0', feeValue === fee.value && 'bg-white/20')}
            text={fee.label}
            key={index}
          />
        ))}
      </div>
      <Callout type={CalloutType.INFO}>
        Performance fees are capped at 50%.
        <span className='inline-block'>
          <Button
            // TODO: add link
            onClick={() => {}}
            variant='transparent'
            color='quaternary'
            size='xs'
            className='hover:underline'
            text='Learn more'
          />
        </span>
      </Callout>
    </div>
  )
}
