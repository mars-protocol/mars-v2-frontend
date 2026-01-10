import { useMemo } from 'react'

import DropDownButton from 'components/common/Button/DropDownButton'
import { HandCoins, Plus } from 'components/common/Icons'
import useChainConfig from 'hooks/chain/useChainConfig'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { byDenom } from 'utils/array'

interface Props {
  data: BorrowMarketTableData
}

export default function Manage(props: Props) {
  const address = useStore((s) => s.address)
  const { data: balances } = useWalletBalances(address)
  const hasBalance = !!balances.find(byDenom(props.data.asset.denom))
  const chainConfig = useChainConfig()
  const isOsmosis = chainConfig.isOsmosis

  const isBorrowEnabled = props.data.asset.isBorrowEnabled

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      ...(isBorrowEnabled
        ? [
            {
              icon: <Plus />,
              text: 'Borrow more',
              onClick: () =>
                useStore.setState({
                  v1BorrowAndRepayModal: { type: 'borrow', data: props.data },
                }),
            },
          ]
        : []),
      {
        icon: <HandCoins />,
        text: 'Repay',
        onClick: () =>
          useStore.setState({
            v1BorrowAndRepayModal: { type: 'repay', data: props.data },
          }),
        disabled: !hasBalance,
        disabledTooltip: `You don't have any ${props.data.asset.symbol} in your Wallet.`,
      },
    ],
    [hasBalance, props.data, isBorrowEnabled],
  )

  return (
    <div className='z-10 flex justify-end'>
      <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
    </div>
  )
}
