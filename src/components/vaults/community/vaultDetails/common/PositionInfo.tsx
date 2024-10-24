import { FormattedNumber } from 'components/common/FormattedNumber'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import Text from 'components/common/Text'

interface Props {
  value: number
  subtitle: string
  primaryButton: ButtonProps
  secondaryButton: ButtonProps
  address: string
}

export default function PositionInfo(props: Props) {
  const { value, subtitle, primaryButton, secondaryButton, address } = props

  //  temp: if address - owner of the vault else user who deposited into vault
  const isOwner = Boolean(address)

  return (
    <Card className='bg-white/5 w-full'>
      <div className='flex justify-between items-center p-5'>
        <div className='flex flex-col gap-1'>
          <Text size='xs' className='text-white/50'>
            {isOwner ? 'Performance Fee' : 'My Position'}
          </Text>
          <div className='flex items-baseline gap-2'>
            <Text size='2xl'>
              <FormattedNumber
                amount={value}
                options={{ minDecimals: 2, maxDecimals: 2, prefix: '$' }}
              />
            </Text>
            <Text size='xs' className='text-white/60'>
              {subtitle}
            </Text>
          </div>
          {isOwner && (
            <Text size='xs' className='text-white/50'>
              Available for withdrawal.
            </Text>
          )}
        </div>

        <div className='flex flex-col md:flex-row gap-2'>
          <div className='flex flex-col md:flex-row gap-2 w-full'>
            <Button {...primaryButton} className='w-32' />
            <Button {...secondaryButton} className='w-32' />
          </div>
        </div>
      </div>
      {isOwner && (
        <div className='bg-black/20 p-2 w-full'>
          <Text size='xs' className='text-white/30 text-center'>
            Withdrawal fees can be edited when you withdraw.
          </Text>
        </div>
      )}
    </Card>
  )
}
