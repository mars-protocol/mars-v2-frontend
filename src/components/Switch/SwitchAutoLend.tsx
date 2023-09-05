import classNames from 'classnames'

import SwitchWithLabel from 'components/Switch/SwitchWithLabel'
import useAutoLend from 'hooks/useAutoLend'

interface Props {
  accountId: string
  className?: string
}

export default function SwitchAutoLend(props: Props) {
  const { accountId, className } = props
  const { autoLendEnabledAccountIds, toggleAutoLend } = useAutoLend()
  const isAutoLendEnabled = autoLendEnabledAccountIds.includes(accountId)

  return (
    <div className={classNames('w-full', className)}>
      <SwitchWithLabel
        name='isLending'
        label='Lend assets to earn yield'
        value={isAutoLendEnabled}
        onChange={() => toggleAutoLend(accountId)}
        tooltip={`Fund your account and lend assets effortlessly! By lending, you'll earn attractive interest (APY) without impacting your LTV. It's a win-win situation - don't miss out on this easy opportunity to grow your holdings!`}
      />
    </div>
  )
}
