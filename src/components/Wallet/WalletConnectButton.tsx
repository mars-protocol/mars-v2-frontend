import { ReactNode, useCallback } from 'react'

import Button from 'components/common/Button'
import { Wallet } from 'components/common/Icons'
import TermsOfService from 'components/common/TermsOfService'
import WalletSelect from 'components/Wallet/WalletSelect'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'

interface Props {
  textOverride?: string | ReactNode
  disabled?: boolean
  className?: string
  color?: ButtonProps['color']
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  short?: boolean
}

export default function WalletConnectButton(props: Props) {
  const [hasAgreedToTerms] = useLocalStorage(LocalStorageKeys.TERMS_OF_SERVICE, false)

  const handleClick = useCallback(() => {
    const component = hasAgreedToTerms ? <WalletSelect /> : <TermsOfService />
    useStore.setState({ focusComponent: { component }, mobileNavExpanded: false })
  }, [hasAgreedToTerms])

  return (
    <Button
      variant={props.variant ?? 'solid'}
      color={props.color ?? 'secondary'}
      size={props.size ?? 'sm'}
      disabled={props.disabled}
      onClick={handleClick}
      leftIcon={<Wallet />}
      className={props.className}
      text={props.textOverride ?? 'Connect Wallet'}
    />
  )
}
