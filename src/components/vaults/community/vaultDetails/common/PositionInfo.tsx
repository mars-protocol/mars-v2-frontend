import { FormattedNumber } from 'components/common/FormattedNumber'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import Text from 'components/common/Text'

interface Props {
  title: string
  value: number
  withdraw?: boolean
  subtext: string
  primaryButton: ButtonProps
  secondaryButton?: ButtonProps
}

export default function PositionInfo(props: Props) {
  const { title, value, withdraw, subtext, primaryButton, secondaryButton } = props
  return (
    <Card className='bg-white/5 p-5 w-full'>
      <div className='flex justify-between items-center'>
        <div className='flex flex-col gap-1'>
          <Text size='xs' className='text-white/50'>
            {title}
          </Text>
          <div className='flex items-baseline gap-2'>
            <Text size='2xl'>
              <FormattedNumber
                amount={value}
                options={{ minDecimals: 2, maxDecimals: 2, prefix: '$' }}
              />
            </Text>
            <Text size='xs' className='text-white/60'>
              {subtext}
            </Text>
          </div>
          {withdraw && (
            <Text size='xs' className='text-white/50'>
              Available for withdrawal.
            </Text>
          )}
        </div>

        <div className='flex flex-col md:flex-row gap-2'>
          <Button
            text={primaryButton.text}
            color='primary'
            onClick={primaryButton.onClick}
            rightIcon={primaryButton.rightIcon}
            disabled={primaryButton.disabled}
          />
          {secondaryButton && (
            <Button
              text={secondaryButton.text}
              color='secondary'
              onClick={secondaryButton.onClick}
              rightIcon={secondaryButton.rightIcon}
              disabled={secondaryButton.disabled}
            />
          )}
        </div>
      </div>
    </Card>
  )
}
