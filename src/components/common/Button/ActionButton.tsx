import { useCallback } from 'react'

import useAccountId from '../../../hooks/accounts/useAccountId'
import useAccountIds from '../../../hooks/accounts/useAccountIds'
import useStore from '../../../store'
import AccountCreateFirst from '../../account/AccountCreateFirst'
import { ACCOUNT_MENU_BUTTON_ID } from '../../account/AccountMenuContent'
import WalletConnectButton from '../../Wallet/WalletConnectButton'
import { Account, PlusCircled } from '../Icons'
import Button from './index'

interface Props extends ButtonProps {
  short?: boolean
}

export default function ActionButton(props: Props) {
  const { className, color, variant, size, short } = props
  const defaultProps = { className, color, variant, size }
  const address = useStore((s) => s.address)
  const isV1 = useStore((s) => s.isV1)
  const { data: accountIds } = useAccountIds(address || '')
  const selectedAccountId = useAccountId()

  const handleCreateAccountClick = useCallback(() => {
    useStore.setState({ focusComponent: { component: <AccountCreateFirst /> } })
  }, [])

  if (!address)
    return <WalletConnectButton {...defaultProps} textOverride={short ? 'Connect' : undefined} />

  if (accountIds && accountIds.length === 0 && !isV1) {
    return (
      <Button
        onClick={handleCreateAccountClick}
        leftIcon={<PlusCircled />}
        text='Create Account'
        {...defaultProps}
      />
    )
  }

  if (!selectedAccountId && !isV1) {
    return (
      <Button
        text='Select Account'
        onClick={() => document.getElementById(ACCOUNT_MENU_BUTTON_ID)?.click()}
        leftIcon={<Account />}
        rightIcon={undefined}
        {...defaultProps}
      />
    )
  }

  return <Button {...props} />
}
