import { useWalletManager, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import { ReactNode } from 'react'

import Button from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import { Wallet } from 'components/Icons'

interface Props {
  textOverride?: string | ReactNode
  disabled?: boolean
  status?: WalletConnectionStatus
}

export default function ConnectButton(props: Props) {
  const { connect } = useWalletManager()

  return (
    <div className='relative'>
      <Button
        variant='solid'
        color='tertiary'
        disabled={props.disabled}
        onClick={connect}
        leftIcon={<Wallet />}
      >
        {props.status === WalletConnectionStatus.Connecting ? (
          <span className='flex justify-center'>
            <CircularProgress size={16} />
          </span>
        ) : (
          <span>{props.textOverride || 'Connect Wallet'}</span>
        )}
      </Button>
    </div>
  )
}
