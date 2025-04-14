import Button from 'components/common/Button'
import Card from 'components/common/Card'
import Text from 'components/common/Text'
import WalletConnectButton from 'components/Wallet/WalletConnectButton'
import { ReactElement } from 'react'
import useStore from 'store'

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
    primaryButton,
    secondaryButton,
    isOwner,
    type = 'performanceFee',
  } = props
  const address = useStore((s) => s.address)

  const title = type === 'performanceFee' ? 'Performance Fee' : 'My Position'
  const showFeeInfo = type === 'performanceFee' && isOwner
  const showVaultPercentage = type === 'depositPosition' && isOwner

  return (
    <Card className='bg-white/5 w-full'>
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

        <div className='flex flex-col gap-2'>
          {!address ? (
            <WalletConnectButton {...primaryButton} />
          ) : isOwner ? (
            <div className='flex flex-col gap-2'>
              <Button {...primaryButton} />
              <Button {...secondaryButton} />
            </div>
          ) : (
            <div className='flex gap-2'>
              <Button {...primaryButton} />
              <Button {...secondaryButton} />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
