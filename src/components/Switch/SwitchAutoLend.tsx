import classNames from 'classnames'

import SwitchWithLabel from 'components/Switch/SwitchWithLabel'
import useAutoLend from 'hooks/useAutoLend'

interface Props {
  accountId: string
  className?: string
  onChange?: () => void
  value?: boolean
}

export default function SwitchAutoLend(props: Props) {
  const { accountId, className } = props
  const { autoLendEnabledAccountIds, toggleAutoLend } = useAutoLend()
  const isAutoLendEnabled = autoLendEnabledAccountIds.includes(accountId)

  function handleToggle() {
    if (props.onChange) return props.onChange()

    toggleAutoLend(accountId)
  }

  return (
    <div className={classNames('w-full', className)}>
      <SwitchWithLabel
        name='isLending'
        label='Lend assets to earn yield'
        value={props.value !== undefined ? props.value : isAutoLendEnabled}
        onChange={handleToggle}
        tooltip={`Fund your account and lend assets effortlessly! By lending, you'll earn attractive interest (APY) without impacting your loan to value (LTV). It's a win-win situation - don't miss out on this easy opportunity to grow your holdings!`}
      />
    </div>
  )
}
