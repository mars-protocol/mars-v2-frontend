import { useMemo } from 'react'

import ActionButton from 'components/common/Button/ActionButton'
import DropDownButton from 'components/common/Button/DropDownButton'
import { ArrowUpLine, CoinsSwap, Enter } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useAccountId from 'hooks/accounts/useAccountId'
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
  const assetDepositAmount = accountDeposits.find(byDenom(props.data.asset.denom))?.amount
  const address = useStore((s) => s.address)
  const accountId = useAccountId()
  const hasNoDeposit = !!(!assetDepositAmount && accountId)
  const hasWalletBalance = walletBalance && BN(walletBalance.amount).isGreaterThan(0)
  const isDefaultAccount = currentAccount?.kind === 'default'
  const isLendEnabled = !!props.data.asset.isAutoLendEnabled

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      {
        icon: <Enter />,
        text: 'Deposit',
        onClick: () => {
          openDeposit(props.data)
        },
      },
      ...(isLendEnabled
        ? [
            {
              icon: <CoinsSwap />,
              text: 'Deposit & Lend',
              onClick: () => {
                openDepositAndLend(props.data)
              },
            },
          ]
        : []),
      ...(isLendEnabled && assetDepositAmount
        ? [
            {
              icon: <ArrowUpLine />,
              text: 'Lend',
              onClick: () => openLend(props.data),
            },
          ]
        : []),
    ],
    [assetDepositAmount, isLendEnabled, openLend, openDeposit, openDepositAndLend, props.data],
  )

  // If user has wallet balance and it's a default account, show Manage dropdown
  if (hasWalletBalance && address && isDefaultAccount) {
    return (
      <div className='flex justify-end'>
        <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
      </div>
    )
  }

  if (!isLendEnabled) return null

  // Otherwise show the original Lend button
  return (
    <div className='flex justify-end'>
      <ConditionalWrapper
        condition={hasNoDeposit && !!address}
        wrapper={(children) => (
          <Tooltip
            type='warning'
            content={
              <Text size='sm'>{`You don't have any ${props.data.asset.symbol}.
             Please first deposit ${props.data.asset.symbol} into your Credit Account before lending.`}</Text>
            }
            contentClassName='max-w-[200px]'
            className='ml-auto'
          >
            {children}
          </Tooltip>
        )}
      >
        <ActionButton
          leftIcon={<ArrowUpLine />}
          disabled={hasNoDeposit}
          color='tertiary'
          onClick={(e) => {
            openLend(props.data)
            e.stopPropagation()
          }}
          text='Lend'
          short
        />
      </ConditionalWrapper>
    </div>
  )
}
