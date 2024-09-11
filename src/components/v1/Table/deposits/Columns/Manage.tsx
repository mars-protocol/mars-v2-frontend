import { useMemo } from 'react'

import useWalletBalances from '../../../../../hooks/wallet/useWalletBalances'
import useStore from '../../../../../store'
import { byDenom } from '../../../../../utils/array'
import DropDownButton from '../../../../common/Button/DropDownButton'
import { ArrowDownLine, ArrowUpLine } from '../../../../common/Icons'

interface Props {
  data: LendingMarketTableData
}

export default function Manage(props: Props) {
  const address = useStore((s) => s.address)
  const { data: balances } = useWalletBalances(address)
  const hasBalance = !!balances.find(byDenom(props.data.asset.denom))

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      {
        icon: <ArrowUpLine />,
        text: 'Deposit more',
        onClick: () =>
          useStore.setState({
            v1DepositAndWithdrawModal: { type: 'deposit', data: props.data },
          }),
        disabled: !hasBalance,
        disabledTooltip: `You don’t have any ${props.data.asset.symbol} in your Wallet.`,
      },
      {
        icon: <ArrowDownLine />,
        text: 'Withdraw',
        onClick: () =>
          useStore.setState({
            v1DepositAndWithdrawModal: { type: 'withdraw', data: props.data },
          }),
      },
    ],
    [hasBalance, props.data],
  )

  return (
    <div className='z-10 flex justify-end'>
      <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
    </div>
  )
}
