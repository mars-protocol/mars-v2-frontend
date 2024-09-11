import classNames from 'classnames'
import { useCallback } from 'react'

import useEnableAutoLendGlobal from 'hooks/localStorage/useEnableAutoLendGlobal'
import useAutoLend from 'hooks/wallet/useAutoLend'
import SwitchWithLabel from './SwitchWithLabel'

interface Props {
  accountId: string
  className?: string
}

export default function SwitchAutoLend(props: Props) {
  const { accountId, className } = props
  const { disableAutoLend, enableAutoLend, isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const [_, setIsAutoLendEnabled] = useEnableAutoLendGlobal()

  const handleToggle = useCallback(() => {
    if (!isAutoLendEnabledForCurrentAccount) {
      enableAutoLend(accountId)
      return
    }

    setIsAutoLendEnabled(false)
    disableAutoLend(accountId)
  }, [
    accountId,
    disableAutoLend,
    enableAutoLend,
    isAutoLendEnabledForCurrentAccount,
    setIsAutoLendEnabled,
  ])

  return (
    <div className={classNames('w-full', className)}>
      <SwitchWithLabel
        name={`isLending-${accountId}`}
        label='Lend assets to earn yield'
        value={isAutoLendEnabledForCurrentAccount}
        onChange={handleToggle}
        tooltip={`Fund your account and lend assets effortlessly! By lending, you'll earn attractive interest (APY) without impacting your loan to value (LTV). It's a win-win situation - don't miss out on this easy opportunity to grow your holdings!`}
      />
    </div>
  )
}
