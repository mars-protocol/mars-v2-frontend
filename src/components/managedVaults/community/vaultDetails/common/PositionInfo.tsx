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
}

export default function PositionInfo(props: Props) {
  const { value, subtitle, primaryButton, secondaryButton, isOwner } = props
  const address = useStore((s) => s.address)

  return (
    <Card className='bg-white/5 w-full'>
      <div className='flex justify-between items-center p-5'>
        <div className='flex flex-col gap-1'>
          <Text size='xs' className='text-white/50'>
            {isOwner ? 'Performance Fee' : 'My Position'}
          </Text>
          <div className='flex flex-col md:flex-row items-baseline md:gap-1'>
            {value}
            {subtitle}
          </div>
          {isOwner && (
            <Text size='xs' className='text-white/50'>
              Available for withdrawal.
            </Text>
          )}
        </div>

        <div className='flex flex-col md:flex-row gap-2'>
          <div className='flex flex-col md:flex-row gap-2 w-full'>
            {!address ? (
              <WalletConnectButton {...primaryButton} />
            ) : (
              <>
                <Button {...primaryButton} />
                <Button {...secondaryButton} />
              </>
            )}
          </div>
        </div>
      </div>
      {isOwner && (
        <div className='bg-black/20 p-2 w-full'>
          <Text size='xs' className='text-white/30 text-center'>
            Performance fees can be edited when you withdraw.
          </Text>
        </div>
      )}
    </Card>
  )
}
