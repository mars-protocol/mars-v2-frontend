import { useCallback } from 'react'

import AccountCreateSelect from 'components/account/AccountCreateSelect'
import { ACCOUNT_MENU_BUTTON_ID } from 'components/account/AccountMenuContent'
import Button from 'components/common/Button/index'
import { Account, PlusCircled } from 'components/common/Icons'
import WalletConnectButton from 'components/Wallet/WalletConnectButton'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useAccountId from 'hooks/accounts/useAccountId'
import useStore from 'store'

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
    useStore.setState({ focusComponent: { component: <AccountCreateSelect /> } })
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
