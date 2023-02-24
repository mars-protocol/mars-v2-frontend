import { useWalletManager, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import { ReactNode } from 'react'

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
      <button
        disabled={props.disabled}
        className='flex h-[31px] min-w-[186px] flex-1 flex-nowrap content-center items-center justify-center rounded-2xl border border-white/60 bg-black/10 px-4 pt-0.5 text-white text-2xs-caps hover:border-white hover:bg-white/60'
        onClick={connect}
      >
        {props.status === WalletConnectionStatus.Connecting ? (
          <span className='flex justify-center'>
            <CircularProgress size={16} />
          </span>
        ) : (
          <>
            <span className='flex h-4 w-4 items-center justify-center'>
              <Wallet />
            </span>
            <span className='ml-2 mt-0.5'>{props.textOverride || 'Connect Wallet'}</span>
          </>
        )}
      </button>
    </div>
  )
}
