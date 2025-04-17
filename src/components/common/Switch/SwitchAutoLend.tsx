import classNames from 'classnames'
import { useCallback } from 'react'

import SwitchWithLabel from 'components/common/Switch/SwitchWithLabel'
import useEnableAutoLendGlobal from 'hooks/localStorage/useEnableAutoLendGlobal'
import useAutoLend from 'hooks/wallet/useAutoLend'

interface Props {
  accountId: string
  className?: string
  isNewAccount?: boolean
}

export default function SwitchAutoLend(props: Props) {
  const { accountId, className, isNewAccount = false } = props
  const { disableAutoLend, enableAutoLend, isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const [isAutoLendEnabledGlobal, setIsAutoLendEnabledGlobal] = useEnableAutoLendGlobal()

  const handleToggle = useCallback(() => {
    if (isNewAccount) {
      setIsAutoLendEnabledGlobal(!isAutoLendEnabledGlobal)
    } else if (!isAutoLendEnabledForCurrentAccount) {
      enableAutoLend(accountId)
    } else {
      disableAutoLend(accountId)
    }
  }, [
    isNewAccount,
    accountId,
    disableAutoLend,
    enableAutoLend,
    isAutoLendEnabledForCurrentAccount,
    isAutoLendEnabledGlobal,
    setIsAutoLendEnabledGlobal,
  ])

  const isEnabled = isNewAccount ? isAutoLendEnabledGlobal : isAutoLendEnabledForCurrentAccount

  return (
    <div className={classNames('w-full', className)}>
      <SwitchWithLabel
        name={`isLending-${accountId}`}
        label='Lend assets to earn yield'
        value={isEnabled}
        onChange={handleToggle}
        tooltip={`Fund your account and lend assets effortlessly! By lending, you'll earn attractive interest (APY) without impacting your loan to value (LTV). It's a win-win situation - don't miss out on this easy opportunity to grow your holdings!`}
      />
    </div>
  )
}
