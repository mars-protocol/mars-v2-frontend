import classNames from 'classnames'
import { useCallback } from 'react'

import SwitchWithLabel from 'components/Switch/SwitchWithLabel'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAutoLend from 'hooks/useAutoLend'
import useLocalStorage from 'hooks/useLocalStorage'

interface Props {
  accountId: string
  className?: string
}

export default function SwitchAutoLend(props: Props) {
  const { accountId, className } = props
  const { autoLendEnabledAccountIds, disableAutoLend, enableAutoLend } = useAutoLend()
  const isAutoLendEnabledForAccount = autoLendEnabledAccountIds.includes(accountId)
  const [isAutoLendEnabled, setIsAutoLendEnabled] = useLocalStorage<boolean>(
    LocalStorageKeys.LEND_ASSETS,
    DEFAULT_SETTINGS.lendAssets,
  )

  const handleToggle = useCallback(() => {
    if (!isAutoLendEnabledForAccount) {
      enableAutoLend(accountId)
      return
    }

    if (isAutoLendEnabled) {
      setIsAutoLendEnabled(false)
      disableAutoLend(accountId)
    }
  }, [
    accountId,
    disableAutoLend,
    enableAutoLend,
    isAutoLendEnabled,
    isAutoLendEnabledForAccount,
    setIsAutoLendEnabled,
  ])

  return (
    <div className={classNames('w-full', className)}>
      <SwitchWithLabel
        name={`isLending-${accountId}`}
        label='Lend assets to earn yield'
        value={isAutoLendEnabledForAccount}
        onChange={handleToggle}
        tooltip={`Fund your account and lend assets effortlessly! By lending, you'll earn attractive interest (APY) without impacting your loan to value (LTV). It's a win-win situation - don't miss out on this easy opportunity to grow your holdings!`}
      />
    </div>
  )
}
