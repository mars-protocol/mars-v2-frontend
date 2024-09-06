import Button from 'components/common/Button'
import Input from 'components/vaults/community/createVault/Input'
import { Callout, CalloutType } from 'components/common/Callout'

const fees = ['1%', '2%', '5%', '10%', '15%', '20%']

export default function PerformanceFee() {
  return (
    <div className='w-full mb-6 space-y-3'>
      <Input
        type='text'
        value={''}
        onChange={() => {}}
        label='Specify your performance fee'
        suffix='%'
        placeholder='Enter fee'
      />
      <div className='flex gap-2 justify-evenly'>
        {fees.map((fee, index) => (
          <Button
            onClick={() => {}}
            variant='solid'
            color='tertiary'
            size='sm'
            className='w-full min-w-0'
            text={fee}
            key={index}
          />
        ))}
      </div>
      <Callout type={CalloutType.INFO}>
        Performance fees are capped at 50%.
        <span className='inline-block'>
          <Button
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
