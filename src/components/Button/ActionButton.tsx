import { useCallback } from 'react'
import { useParams } from 'react-router-dom'

import AccountCreateFirst from 'components/Account/AccountCreateFirst'
import { ACCOUNT_MENU_BUTTON_ID } from 'components/Account/AccountMenuContent'
import Button from 'components/Button'
import { Account, PlusCircled } from 'components/Icons'
import WalletConnectButton from 'components/Wallet/WalletConnectButton'
import useStore from 'store'

interface Props extends ButtonProps {}

export default function ActionButton(props: Props) {
  const address = useStore((s) => s.address)
  const accounts = useStore((s) => s.accounts)
  const { accountId } = useParams()

  const handleCreateAccountClick = useCallback(() => {
    useStore.setState({ focusComponent: <AccountCreateFirst /> })
  }, [])

  if (!address)
    return (
      <WalletConnectButton
        className={props.className}
        color={props.color}
        variant={props.variant}
        size={props.size}
      />
    )

  if (accounts && accounts.length === 0)
    return (
      <Button
        onClick={handleCreateAccountClick}
        leftIcon={<PlusCircled />}
        className={props.className}
        color={props.color}
        variant={props.variant}
        size={props.size}
        text='Create Account'
      />
    )

  if (!accountId)
    return (
      <Button
        className={props.className}
        color={props.color}
        size={props.size}
        text='Select Account'
        variant={props.variant}
        onClick={() => document.getElementById(ACCOUNT_MENU_BUTTON_ID)?.click()}
        leftIcon={<Account />}
        rightIcon={undefined}
      />
    )

  return <Button {...props} />
}
