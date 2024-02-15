import { useMemo } from 'react'

import DropDownButton from 'components/common/Button/DropDownButton'
import { ArrowDownLine, ArrowUpLine } from 'components/common/Icons'
import useLendAndReclaimModal from 'hooks/useLendAndReclaimModal'
import useWalletBalances from 'hooks/useWalletBalances'
import useStore from 'store'
import { byDenom } from 'utils/array'

interface Props {
  data: LendingMarketTableData
}

export default function Manage(props: Props) {
  const { openLend, openReclaim } = useLendAndReclaimModal()
  const address = useStore((s) => s.address)
  const { data: balances } = useWalletBalances(address)
  const hasBalance = !!balances.find(byDenom(props.data.asset.denom))

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      {
        icon: <ArrowUpLine />,
        text: 'Deposit more',
        onClick: () => openLend(props.data),
        disabled: !hasBalance,
        disabledTooltip: `You don’t have any ${props.data.asset.symbol} in your Wallet.`,
      },
      {
        icon: <ArrowDownLine />,
        text: 'Withdraw',
        onClick: () => openReclaim(props.data),
      },
    ],
    [hasBalance, openLend, openReclaim, props.data],
  )

  return (
    <div className='z-10 flex justify-end'>
      <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
    </div>
  )
}
