import Card from 'components/common/Card'
import Text from 'components/common/Text'
import { ReactElement } from 'react'

interface Props {
  value: ReactElement
  subtitle: React.ReactNode
  primaryButton: ButtonProps
  secondaryButton: ButtonProps
  isOwner: boolean
  type?: 'performanceFee' | 'depositPosition'
}

export default function PositionInfo(props: Props) {
  const {
    value,
    subtitle,
    isOwner,
    type = 'performanceFee',
  } = props

  const title = type === 'performanceFee' ? 'Performance Fee' : 'My Position'
  const showFeeInfo = type === 'performanceFee' && isOwner
  const showVaultPercentage = type === 'depositPosition' && isOwner

  return (
    <Card className='w-full'>
      <div className='flex justify-between items-center p-5'>
        <div className='flex flex-col gap-1'>
          <Text size='xs' className='text-white/50'>
            {title}
          </Text>
          <div className='flex md:flex-row items-baseline gap-1'>
            {value}
            {!showVaultPercentage && subtitle}
          </div>
          {showFeeInfo && (
            <Text size='xs' className='text-white/50'>
              Available for withdrawal.
            </Text>
          )}
          {showVaultPercentage && (
            <Text size='xs' className='text-white/50'>
              {subtitle}
            </Text>
          )}
        </div>
      </div>
    </Card>
  )
}
