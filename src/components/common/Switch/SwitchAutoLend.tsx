import classNames from 'classnames'
import { useCallback } from 'react'

import SwitchWithLabel from 'components/common/Switch/SwitchWithLabel'
import useEnableAutoLendGlobal from 'hooks/localStorage/useEnableAutoLendGlobal'
import useAutoLend from 'hooks/wallet/useAutoLend'

interface Props {
  accountId?: string
  className?: string
  isEnabled?: boolean
  onChange?: (value: boolean) => void
}

export default function SwitchAutoLend(props: Props) {
  const { accountId, className, isEnabled: externalIsEnabled, onChange } = props
  const { disableAutoLend, enableAutoLend, isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const [isAutoLendEnabled, setIsAutoLendEnabled] = useEnableAutoLendGlobal()

  const handleToggle = useCallback(() => {
    const newValue = accountId ? !isAutoLendEnabledForCurrentAccount : !externalIsEnabled

    if (accountId) {
      // Existing account scenario
      if (newValue) {
        enableAutoLend(accountId)
      } else {
        disableAutoLend(accountId)
      }
    } else {
      // New account scenario
      setIsAutoLendEnabled(newValue)
      if (onChange) {
        onChange(newValue)
      }
    }
  }, [
    accountId,
    disableAutoLend,
    enableAutoLend,
    externalIsEnabled,
    isAutoLendEnabledForCurrentAccount,
    onChange,
    setIsAutoLendEnabled,
  ])

  const switchValue = accountId
    ? isAutoLendEnabledForCurrentAccount
    : (externalIsEnabled ?? isAutoLendEnabled)

  return (
    <div className={classNames('w-full', className)}>
      <SwitchWithLabel
        name={`isLending-${accountId}`}
        label='Lend assets to earn yield'
        value={switchValue}
        onChange={handleToggle}
        tooltip={`Fund your account and lend assets effortlessly! By lending, you'll earn attractive interest (APY) without impacting your loan to value (LTV). It's a win-win situation - don't miss out on this easy opportunity to grow your holdings!`}
      />
    </div>
  )
}
