import { useWalletManager, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import { ReactNode, useCallback } from 'react'

import Button from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import { Wallet } from 'components/Icons'
import { TERMS_OF_SERVICE_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import useStore from 'store'

interface Props {
  textOverride?: string | ReactNode
  disabled?: boolean
  status?: WalletConnectionStatus
}

export default function ConnectButton(props: Props) {
  const { connect } = useWalletManager()
  const [hasAgreedToTerms] = useLocalStorage(TERMS_OF_SERVICE_KEY, false)

  const handleConnect = useCallback(() => {
    if (!hasAgreedToTerms) {
      useStore.setState({ showTermsOfService: true, isFocusMode: true })
      return
    }
    connect()
  }, [connect, hasAgreedToTerms])

  return (
    <div className='relative'>
      <Button
        variant='solid'
        color='tertiary'
        disabled={props.disabled}
        onClick={handleConnect}
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
