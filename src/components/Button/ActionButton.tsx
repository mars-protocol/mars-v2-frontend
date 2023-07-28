import { useCallback } from 'react'
import { useParams } from 'react-router-dom'

import AccountCreateFirst from 'components/Account/AccountCreateFirst'
import { ACCOUNT_MENU_BUTTON_ID } from 'components/Account/AccountMenuContent'
import Button from 'components/Button'
import { Account, PlusCircled } from 'components/Icons'
import WalletConnectButton from 'components/Wallet/WalletConnectButton'
import useStore from 'store'

export default function ActionButton(props: ButtonProps) {
  const { className, color, variant, size } = props
  const defaultProps = { className, color, variant, size }
  const address = useStore((s) => s.address)
  const accounts = useStore((s) => s.accounts)
  const { accountId } = useParams()

  const handleCreateAccountClick = useCallback(() => {
    useStore.setState({ focusComponent: <AccountCreateFirst /> })
  }, [])

  if (!address) return <WalletConnectButton {...defaultProps} />

  if (accounts && accounts.length === 0)
    return (
      <Button
        onClick={handleCreateAccountClick}
        leftIcon={<PlusCircled />}
        text='Create Account'
        {...defaultProps}
      />
    )

  if (!accountId)
    return (
      <Button
        text='Select Account'
        onClick={() => document.getElementById(ACCOUNT_MENU_BUTTON_ID)?.click()}
        leftIcon={<Account />}
        rightIcon={undefined}
        {...defaultProps}
      />
    )

  return <Button {...props} />
}
