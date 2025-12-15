import { useCallback, useMemo } from 'react'

import DropDownButton from 'components/common/Button/DropDownButton'
import { AccountArrowDown, ArrowUpLine, CoinsSwap, Enter } from 'components/common/Icons'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useDepositModal from 'hooks/common/useDepositModal'
import useLendAndReclaimModal from 'hooks/common/useLendAndReclaimModal'
import useCurrentAccountDeposits from 'hooks/wallet/useCurrentAccountDeposits'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

export const LEND_BUTTON_META = {
  accessorKey: 'lend',
  enableSorting: false,
  header: '',
  meta: {
    className: 'w-35',
  },
}

interface Props {
  data: LendingMarketTableData
}
export default function LendButton(props: Props) {
  const { openLend } = useLendAndReclaimModal()
  const { openDeposit, openDepositAndLend } = useDepositModal()
  const accountDeposits = useCurrentAccountDeposits()
  const currentAccount = useCurrentAccount()
  const walletBalance = useCurrentWalletBalance(props.data.asset.denom)
  const isAutoLendEnabled = props.data.asset.isAutoLendEnabled
  const assetDepositAmount = accountDeposits.find(byDenom(props.data.asset.denom))?.amount
  const address = useStore((s) => s.address)
  const hasWalletBalance = walletBalance && BN(walletBalance.amount).isGreaterThan(0)
  
  // Check if user has this specific asset in deposits or lends
  const hasThisAssetInAccount = useMemo(() => {
    const inDeposits = currentAccount?.deposits?.find(byDenom(props.data.asset.denom))?.amount
    const inLends = currentAccount?.lends?.find(byDenom(props.data.asset.denom))?.amount
    return (inDeposits && !inDeposits.isZero()) || (inLends && !inLends.isZero())
  }, [currentAccount?.deposits, currentAccount?.lends, props.data.asset.denom])

  const handleWithdraw = useCallback(() => {
    useStore.setState({ fundAndWithdrawModal: 'withdraw' })
  }, [])

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      ...(hasWalletBalance
        ? [
            {
              icon: <Enter />,
              text: 'Deposit',
              onClick: () => openDeposit(props.data),
            },
            {
              icon: <CoinsSwap />,
              text: 'Deposit & Lend',
              onClick: () => openDepositAndLend(props.data),
            },
          ]
        : []),
      ...(assetDepositAmount
        ? [
            {
              icon: <ArrowUpLine />,
              text: 'Lend',
              onClick: () => openLend(props.data),
            },
          ]
        : []),
      ...(hasThisAssetInAccount
        ? [
            {
              icon: <AccountArrowDown />,
              text: 'Withdraw',
              onClick: handleWithdraw,
            },
          ]
        : []),
    ],
    [
      assetDepositAmount,
      hasThisAssetInAccount,
      hasWalletBalance,
      handleWithdraw,
      openDeposit,
      openDepositAndLend,
      openLend,
      props.data,
    ],
  )

  if (!isAutoLendEnabled && address) return null
  if (!address) return null
  if (ITEMS.length === 0) return null

  return (
    <div className='flex justify-end'>
      <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
    </div>
  )
}
