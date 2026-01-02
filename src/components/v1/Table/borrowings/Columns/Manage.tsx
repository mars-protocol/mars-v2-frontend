import { useMemo } from 'react'

import DropDownButton from 'components/common/Button/DropDownButton'
import { HandCoins, Plus } from 'components/common/Icons'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { ChainInfoID } from 'types/enums'
import { byDenom } from 'utils/array'

interface Props {
  data: BorrowMarketTableData
}

export default function Manage(props: Props) {
  const address = useStore((s) => s.address)
  const chainConfig = useStore((s) => s.chainConfig)
  const { data: balances } = useWalletBalances(address)
  const hasBalance = !!balances.find(byDenom(props.data.asset.denom))

  const isUSDC = useMemo(
    () => props.data.asset?.symbol?.toUpperCase().includes('USDC'),
    [props.data.asset?.symbol],
  )

  const isBorrowEnabled = props.data.asset.isBorrowEnabled
  const isNeutron = chainConfig.id === ChainInfoID.Neutron1
  const isUSDCDisabled = isUSDC && isNeutron
  const canBorrowMore = isBorrowEnabled && !isUSDCDisabled

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      ...(canBorrowMore
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
    [hasBalance, props.data, canBorrowMore],
  )

  return (
    <div className='z-10 flex justify-end'>
      <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
    </div>
  )
}
