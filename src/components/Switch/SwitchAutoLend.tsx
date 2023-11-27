import classNames from 'classnames'
import { useEffect } from 'react'

import SwitchWithLabel from 'components/Switch/SwitchWithLabel'
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
  const isAutoLendEnabled = autoLendEnabledAccountIds.includes(accountId)
  const [lendAssets, setLendAssets] = useLocalStorage<boolean | null>(
    LocalStorageKeys.LEND_ASSETS,
    null,
  )

  useEffect(() => {
    if (lendAssets && !isAutoLendEnabled) enableAutoLend(accountId)
  }, [lendAssets, isAutoLendEnabled])

  return (
    <div className={classNames('w-full', className)}>
      <SwitchWithLabel
        name={`isLending-${accountId}`}
        label='Lend assets to earn yield'
        value={isAutoLendEnabled}
        onChange={() => {
          if (isAutoLendEnabled) {
            setLendAssets(false)
            disableAutoLend(accountId)
            return
          }
          enableAutoLend(accountId)
        }}
        tooltip={`Fund your account and lend assets effortlessly! By lending, you'll earn attractive interest (APY) without impacting your loan to value (LTV). It's a win-win situation - don't miss out on this easy opportunity to grow your holdings!`}
      />
    </div>
  )
}
