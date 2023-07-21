import { ReactNode, useCallback } from 'react'

import Button from 'components/Button'
import { Wallet } from 'components/Icons'
import TermsOfService from 'components/TermsOfService'
import WalletSelect from 'components/Wallet/WalletSelect'
import { TERMS_OF_SERVICE_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import useStore from 'store'

interface Props {
  textOverride?: string | ReactNode
  disabled?: boolean
}

export default function WalletConnectButton(props: Props) {
  const [hasAgreedToTerms] = useLocalStorage(TERMS_OF_SERVICE_KEY, false)

  const handleClick = useCallback(() => {
    const focusedComponent = hasAgreedToTerms ? <WalletSelect /> : <TermsOfService />
    useStore.setState({ focusComponent: focusedComponent })
  }, [hasAgreedToTerms])

  return (
    <div className='relative'>
      <Button
        variant='solid'
        color='tertiary'
        disabled={props.disabled}
        onClick={handleClick}
        leftIcon={<Wallet />}
      >
        <span>{props.textOverride || 'Connect Wallet'}</span>
      </Button>
    </div>
  )
}
